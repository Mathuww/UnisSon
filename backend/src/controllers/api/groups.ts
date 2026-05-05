import { NextFunction, Request, Response, urlencoded } from "express";
import { asyncHandler } from "../../middleware/error.js";
import { logger, loggerMiddleware } from "../../middleware/logger.js";
import Group from "../../models/elem/Group.model.js";
import Track from "../../models/elem/Track.model.js";
import { getNextGroupStatus, GroupStatus } from "../../shared/GroupStatus.js";
import User from "../../models/elem/User.model.js";
import GroupUser from "../../models/link/GroupUser.model.js";
import GroupPeriod from "../../models/logic/GroupPeriod.model.js";
import { PeriodType } from "../../shared/PeriodType.js";
import { TimeManager } from "../../shared/TimeManager.js";
import { generalPollingTask } from "../../tasks/polling.task.js";
import GroupPlaylist from "../../models/link/GroupPlaylist.model.js";
import { Op } from "sequelize";
import { AuthService } from "../../service/auth.service.js";
import { YoutubeService } from "../../service/youtube.service.js";
import { getIO } from "../../shared/socket.js";
import RealRank from "../../models/logic/RealRank.model.js";
import PredRank from "../../models/logic/PredRank.model.js";

/**
 * Contrôleurs associés aux routes /api/groups/...
 */
export const GroupController = {
    /**
     * Crée un groupe.
     */
    createGroup: asyncHandler( async (req: Request, res: Response) => {
        const { name, maxUsers } = req.body;
        if (!name || !maxUsers)
            return res.status(400).json({error: {message: "Missing group name or max users from group create request"}});

        const user : User = (req as any).user; 

        const group = await Group.create({
            name,
            maxUsers,
            status: GroupStatus.SAT_DONE_QUIZ
        });

        // Prochain dimanche, on lance le cycle
        await GroupPeriod.create({
            groupID: group.id,
            periodType: PeriodType.NEW_CYCLE,
            periodStart: TimeManager.getNextDay(0) // dimanche
        });

        // Crée la playlist associé au groupe dans 
        // le compte YT de l'utilisateur qui crée le groupe
        const client = await AuthService.getOAuthClient(user);
        let playlistId = undefined;
        if (client) {
            logger.info(`Creating playlist.. for group ${group.id}`);
            const ytResponse = await YoutubeService.addPlaylist(`Suggestions de ${group.name} (UnisSon)`, client);
            if (ytResponse && ytResponse.data) {
                playlistId = ytResponse.data.id;
            }
        } else {
            logger.error(`Error while creating playlist for group ${group.id}`);
        }

        await group.addUser(user.id, {
            through: {
                notifPending: false,
                weeklyScore: 0,
                globalScore: 0,
                servicePlaylistID: playlistId ?? null
            }
        });

        // Lance une tâche de polling
        await generalPollingTask();

        return res.status(201).json({data: group});
    }),
    /**
     * Middleware utilisé pour vérifier que
     * l'user qui fait une requête dans /api/groups/{id}/... 
     * appartient bien au groupe {id}
     * (sauf pour POST /api/groups/ qui crée un groupe)  
     * @param req 
     * @param res 
     * @param next 
     * @returns 
     */
    groupUserCheck: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const groupId = Number(req.params.id);
            logger.info(req.params);

            if (Number.isNaN(groupId))
                return res.status(400).json({error: {message: "Missing group ID"}});

            const group = await Group.findByPk(groupId);
            if (!group)
                return res.status(404).json({error: {message: "Unable to find group"}});

            if (!(await group.isUserInGroup(user.id)))
                return res.status(403).json({error: {message: "User is not in group"}});

            (req as any).group = group;
            next();
        } catch (err) {
            logger.error("Error in group user check middleware", {err});
            return res.status(500).json({error: {message: "Internal server error"}});
        }
    },
    /**
     * Renvoie les infos sur un groupe.
     */
    groupInfo: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const includeUsers = (req.query.includeUsers === "true");

        if (includeUsers) {
            const users = await group.getUsers({
                // On en profite pour récupérer les scores
                joinTableAttributes: ['weeklyScore', 'globalScore']
            }) as (User & { GroupUser: GroupUser })[];
            const chosenOne = await group?.getChosenUser();
            const canUserAdd = await group?.canUserAdd(user.id);
            const gu = await GroupUser.findOne({where: {groupID: group.id, userID: user.id}});
            const data = {
                    id: group.id,
                    name: group.name,
                    status: group.status,
                    chosenOne: chosenOne || null,
                    theme: group.theme,
                    maxUsers: group.maxUsers,
                    canUserAdd,
                    weeklyScore: gu?.weeklyScore,
                    globalScore: gu?.globalScore,
                    quizDone: gu?.quizDone,
                    rankDone: gu?.rankDone,
                    // On ajout le score à chaque utilisateur,
                    // et on trie par score hebdomadaire décroissant
                    users: users.map(u => ({
                        id: u.id,
                        nickname: u.nickname,
                        email: u.email,
                        weeklyScore: u.GroupUser.weeklyScore,
                        globalScore: u.GroupUser.globalScore,
                    })).sort((a, b) => (b.weeklyScore ?? 0) - (a.weeklyScore ?? 0))
                };
            return res.status(200).json({
                data: data
            });
        } else
            return res.status(200).json({data: group});
    }),
    /**
     * Renvoie la liste des membres d'un groupe.
     */
    getUsers: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const users = await group?.getUsers();

        return res.status(200).json({data: users});
    }),
    /**
     * Quitte un groupe.
     */
    leaveGroup: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group = await Group.findByPk(Number(req.params.id));
        if (!group)
            return res.status(404).json({error: {message: "Group not found"}});

        await group.removeUser(user.id);
        logger.info(`${user.id} left group ${group.id}`);

        const remainingUserCount = await GroupUser.count({
            where: {
                groupID: group.id
            }
        });
        if (remainingUserCount <= 0) {
            logger.info(`deleting group ${group.id}`); 
            await PredRank.destroyRankingFor(group.id);
            await RealRank.destroyRankingFor(group.id);
            await group.destroy();
        } else {
            getIO()?.to(`group:${group.id}`).emit(`group:${group.id}:refresh`);
            // pour chaque utilisateur appartenant au groupe
            const users = await group.getUsers({attributes: ['id']});
            for (const user of users) {
                getIO()?.to(`user:${user.id}`).emit(`groups:refresh`);
            }
        }

        return res.status(204).send();
    }),
    /**
     * Ajoute un morceau.
     */
    addTrack: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const { title, youtubeLink } = req.body;
        
        if (!youtubeLink)
            return res.status(400).json({error: {message: "Missing song data"}});

        if (group.status != GroupStatus.WK_WAITING_SUB) {
            return res.status(403).json({error: {message: `Wrong status for adding song (${group.status})`}});
        }

        if ((await group.getChosenUser()).id == user.id) {
            return res.status(403).json({error: {message: `Chosen user cant add a song !`}});
        }

        if (!(await group.canUserAdd(user.id))) {
            return res.status(403).json({error: {message: "This user cant add to this group: they probably already added one song for this period."}});
        }

        const [track, trackCreated] = await Track.findOrCreate({
            where: {
                youtubeLink: youtubeLink,
            }
        });

        if (trackCreated) {
            const youtubeInfo = await YoutubeService.getPublicVideoInfo(youtubeLink);
            if (!youtubeInfo.success) {
                return res.status(404).json({error: {message: "Video ID invalid"}});
            }
            await track.update({
                title: youtubeInfo.title,
                artist: youtubeInfo.artist!
            });
        }

        // Si la track a déjà été ajoutée à ce groupe par le passé,
        // on renvoie une erreur
        const [existingEntry, created] = await GroupPlaylist.findOrCreate({
            where: {
                groupID: group.id,
                userID: user.id,
                trackID: track.id,
            }, defaults: {
                groupID: group.id,
                userID: user.id,
                trackID: track.id,
                addedAt: TimeManager.now()
            }
        });

        if (!created) { // Existe déjà
            return res.status(409).json({error: {message: "Track already added to group in the past."}});
        }

        const gu = await GroupUser.findOne({
            where: {
                userID: user.id,
                groupID: group.id
            }
        });

        // Si tous les membres du groupe ont ajouté pour cette période,
        // on passe en WK_DONE_SUB pour ce groupe
        if (await group.allUsersAdded())
            await group.update({status: GroupStatus.WK_DONE_SUB});

        getIO()?.to(`group:${group.id}`).emit(`group:${group.id}:refresh`);
        // pour chaque utilisateur appartenant au groupe
        const users = await group.getUsers({attributes: ['id']});
        for (const user of users) {
            getIO()?.to(`user:${user.id}`).emit(`groups:refresh`);
        }

        if (trackCreated) {
            logger.info("New track created and added to group : ", track);
            return res.status(201).json({data: track});
        } else {
            logger.info("Track already existed, but was added to group : ", track);
            return res.status(200).json({data: track});
        }
    }),
    /**
     * Stocke le nouveau thème pour ce cycle.
     */
    setTheme: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const { theme }  = req.body;
        if (!theme)
            return res.status(400).json({error: {message: "Missing theme for theme request"}});


        if (group.status != GroupStatus.SUN_WAITING_THEME) {
            return res.status(403).json({error: {message: `Wrong status for setting theme (${group.status})`}});
        }

        if ((await group.getChosenUser()).id != user.id) {
            return res.status(403).json({error: {message: `Only chosen user can set a theme !`}});
        }

        await group.update({
            theme: theme,
            status: GroupStatus.SUN_DONE_THEME
        });

        // pour chaque utilisateur appartenant au groupe
        const users = await group.getUsers({attributes: ['id']});
        getIO()?.to(`group:${group.id}`).emit(`group:${group.id}:refresh`);
        //getIO().emit(`group:${group.id}:refresh`);
        for (const user of users) {
            getIO()?.to(`user:${user.id}`).emit(`groups:refresh`);
            //getIO().emit(`groups:refresh`);
        }

        return res.status(200).json({data: group});
    }),
    /**
     * Renvoie les morceaux ajoutés pour ce cycle.
     */
    getTracks: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const data = await group.getEntriesSinceLastCycle();

        return res.status(200).json({data: data});
    }),
    /**
     * Stocke le score temporaire de l'élu.e,
     * basé sur ces réponses au quiz
     */
    submitChosenQuizAnswers: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const answers: Record<number, number> = req.body.answers;
        if (!answers)
            return res.status(400).json({error: {message: "Missing answers"}});

        console.log("answers ", answers);

        const gu = await GroupUser.findOne({
            where: {
                userID: user.id,
                groupID: group.id
            }
        });
        if (!gu) {
            return res.status(404).json({error: {message: `user ${user.id} has never been added to group ${group.id}`}});
        }

        if (gu.quizDone) {
            return res.status(403).json({error: {message: "user has already submitted a quiz"}});
        }

        if (group.status != GroupStatus.SAT_WAITING_QUIZ) {
            return res.status(403).json({error: {message: `Wrong status for answering quiz (${group.status})`}});
        }

        if ((await group.getChosenUser()).id != user.id) {
            return res.status(403).json({error: {message: `Only chosen user can answer the chosen one quiz  !`}});
        }

        const trackIds = Object.keys(answers).map(Number);
        console.log("trackIds ", trackIds);

        const tracks = await GroupPlaylist.findAll({
            where: {
                trackID: trackIds,
                groupID: group.id
            }
        });
        const trackMap = new Map(
            tracks.map(t => [Number(t.trackID), t])
        );

        let scoreCount = 0;
        for (const [trackId, userId] of Object.entries(answers)) {
            const trackEntry = trackMap.get(Number(trackId));
            if (!trackEntry) {
                // C'est bizarre, ça veut dire que cette track n'a jamais été ajoutée dans ce groupe
                return res.status(404).json({error: {message: `Track ${trackId} has never been added to group ${group.id}`}});
            }
            const goodAnswer = (Number(trackEntry.userID) === Number(userId));
            console.log((goodAnswer ? "good answer" : "false answer") + `for ${user.nickname}, chose ${userId} but good answer was ${userId}`);
            const bonus = goodAnswer ? 20 : 0;
            scoreCount += bonus;
        }

        console.log(`new score for ${user.nickname} is ${scoreCount}`);

        await gu.update({
            tempChosenQuizScore: scoreCount,
            quizDone: true
        });

        return res.status(204).send();
    }),
    /**
     * Stocke le classement de l'élu.e
     */
    submitChosenRanking: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const gu = await GroupUser.findOne({
            where: {
                userID: user.id,
                groupID: group.id
            }
        });
        if (!gu) {
            return res.status(404).json({error: {message: `user ${user.id} has never been added to group ${group.id}`}});
        }

        if (gu.rankDone) {
            return res.status(403).json({error: {message: "this chosen user has already submitted a ranking"}});
        }

        const ranking: {userId: number, trackId: number}[] = req.body.ranking;
        if (!ranking)
            return res.status(400).json({error: {message: "Missing ranking"}});

        if (group.status != GroupStatus.SAT_WAITING_QUIZ) {
            return res.status(403).json({error: {message: `Wrong status for submitting ranking quiz (${group.status})`}});
        }

        if ((await group.getChosenUser()).id != user.id) {
            return res.status(403).json({error: {message: `Only chosen user can submit the real ranking ! !`}});
        }

        let ranks = [];
        for (const [rank, {userId, trackId}] of ranking.entries()) {
            ranks.push({
                rank,
                groupID: group.id,
                trackID: trackId,
                userID: userId,
                oracleUserID: user.id
            })
        }
        await RealRank.bulkCreate(ranks);

        await gu.update({
            rankDone: true
        });

        // No Content
        return res.status(204).send();
    }),
    /**
     * Stocke les prédictions de l'élu.e
     */
    submitPredRanking:  asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const gu = await GroupUser.findOne({
            where: {
                userID: user.id,
                groupID: group.id
            }
        });
        if (!gu) {
            return res.status(404).json({error: {message: `user ${user.id} has never been added to group ${group.id}`}});
        }

        if (gu.rankDone) {
            return res.status(403).json({error: {message: "this chosen user has already submitted a ranking"}});
        }

        const ranking: {userId: number, trackId: number}[] = req.body.ranking;
        if (!ranking)
            return res.status(400).json({error: {message: "Missing ranking"}});

        if (group.status != GroupStatus.SAT_WAITING_QUIZ) {
            return res.status(403).json({error: {message: `Wrong status for submitting ranking quiz (${group.status})`}});
        }

        if ((await group.getChosenUser()).id === user.id) {
            return res.status(403).json({error: {message: `chosen user cant sumbit a pred ranking ! !`}});
        }

        let ranks = [];
        for (const [rank, {userId, trackId}] of ranking.entries()) {
            ranks.push({
                rank,
                groupID: group.id,
                trackID: trackId,
                userID: userId,
                oracleUserID: user.id
            })
        }
        await PredRank.bulkCreate(ranks);

        return res.status(204).send();
    }),
}
