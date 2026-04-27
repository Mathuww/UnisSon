import { NextFunction, Request, Response } from "express";
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

export const GroupController = {
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

        await group.addUser(user.id, {
            through: {
                notifPending: false,
                weeklyScore: 0,
                globalScore: 0
            }
        });

        // prochain dimanche, on lance le cycle
        await GroupPeriod.create({
            groupID: group.id,
            periodType: PeriodType.NEW_CYCLE,
            periodStart: TimeManager.getNextDay(0) // dimanche
        });
        generalPollingTask();

        return res.status(201).json({data: group});
    }),
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
    groupInfo: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const includeUsers = req.query.includeUsers === "true";

        if (includeUsers) {
            const users = await group?.getUsers();
            const chosenOne = await group?.getChosenUser();
            const canUserAdd = await group?.canUserAdd(user.id);
            const data = {
                    id: group.id,
                    name: group.name,
                    status: group.status,
                    chosenOne: chosenOne || null,
                    theme: group.theme,
                    maxUsers: group.maxUsers,
                    canUserAdd,
                    users
                };
            return res.status(200).json({
                data: data
            });
        } else
            return res.status(200).json({data: group});
    }),
    getUsers: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const users = await group?.getUsers();

        return res.status(200).json({data: users});
    }),
    addUser: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group = await Group.findByPk(Number(req.params.id));
        if (!group)
            return res.status(404).json({error: {message: "Group not found"}});

        await group.addUser(user.id, {
            through: {
                notifPending: false,
                weeklyScore: 0,
                globalScore: 0
            }
        });

        return res.status(201).json({data: group});
    }),
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
            await group.destroy();
        }

        return res.status(204).send();
    }),
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

        await GroupPlaylist.create({
            groupID: group.id,
            userID: user.id,
            trackID: track.id,
            addedAt: TimeManager.now()
        })

        // Si tous les membres du groupe ont ajouté pour cette période,
        // on passe en WK_DONE_SUB pour ce groupe
        if (await group.allUsersAdded())
            await group.update({status: GroupStatus.WK_DONE_SUB});

        if (trackCreated) {
            logger.info("New track created and added to group : ", track);
            return res.status(201).json({data: track});
        } else {
            logger.info("Track already existed, but was added to group : ", track);
            return res.status(200).json({data: track});
        }
    }),
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

        return res.status(200).json({data: group});
    }),
    getTracks: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const playlistEntries = await GroupPlaylist.findAll({
            where: {
                groupID: group.id,
                addedAt: {
                    [Op.gte]: group.lastCycleChange || TimeManager.now()
                }
            },
            include: [{model: Track, as: 'Track'}, {model: User, as: 'addedBy'}]
        });

        const data = playlistEntries.map((value) => {
            const trackData = value.Track.get({ plain: true });
            const userData = value.addedBy ? value.addedBy.get({ plain: true }) : null;

            return {
                track: trackData,
                addedBy: userData
            };
        });

        return res.status(200).json({data: data});
    }),
    forceChangeStatus: asyncHandler( async (req, res) => {
        const group: Group = (req as any).group;
        console.log("in forcechangestatus");

        const nextStatus = group.status ? getNextGroupStatus(group.status) : GroupStatus.SUN_WAITING_THEME;

        await group.update({
            status: nextStatus
        });

        if (nextStatus === GroupStatus.SUN_WAITING_THEME)
            await group.updateChosenOne();

        console.log("switched to " + group.status);
        return res.status(200).json({data: group});
    }),
    forceChangeChosen: asyncHandler( async (req, res) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const chosenOneUserID = req.body.chosenOneUserID || user.id;

        await group.update({
            chosenOneUserID
        });

        return res.status(200).json({data: group});
    }),
}
