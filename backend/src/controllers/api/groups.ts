import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../middleware/error.js";
import { logger } from "../../middleware/logger.js";
import Group from "../../models/elem/Group.model.js";
import Track from "../../models/elem/Track.model.js";
import { GroupStatus } from "../../shared/GroupStatus.js";
import User from "../../models/elem/User.model.js";

export const GroupController = {
    createGroup: asyncHandler( async (req: Request, res: Response) => {
        const { name, maxUsers } = req.body;
        if (!name || !maxUsers)
            return res.status(400).json({error: {message: "Missing group name or max users from group create request"}});

        const user : User = (req as any).user; 

        const group = await Group.create({name, maxUsers});

        await group.addUser(user.id, {
            through: {
                notifPending: false,
                weeklyScore: 0,
                globalScore: 0
            }
        });

        return res.status(201).json({data: group});
    }),
    groupUserCheck: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as any).user;
            const groupId = Number(req.params.id);

            if (!groupId)
                return res.status(400).json({error: {message: "Missing group ID"}});

            const group = await Group.findByPk(groupId);
            if (!group)
                return res.status(404).json({error: {message: "Unable to find group"}});

            if (!(await group.isUserInGroup(user.id)))
                return res.status(403).json({error: {message: "User is not in group"}});

            (req as any).group = group;
            next();
        } catch (err) {
            logger.error("Error in group user check middleware");
            return res.status(500).json({error: {message: "Internal server error"}});
        }
    },
    groupInfo: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

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
    getTracks: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const tracks = group.getTracks();
        return res.status(200).json({data: tracks});
    }),
    addTrack: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const group: Group = (req as any).group;

        const { title, youtubeLink } = req.body;
        
        if (!title || !youtubeLink)
            return res.status(400).json({error: {message: "Missing song data"}});

        if (group.status != GroupStatus.WK_WAITING_SUB)
            return res.status(403).json({error: {message: `Wrong status for adding song (${group.status})`}});

        if ((await group.getChosenUser()).id == user.id)
            return res.status(403).json({error: {message: `Chosen user cant add a song !`}});

        if (!(await group.canUserAdd(user.id)))
            return res.status(403).json({error: {message: "This user cant add to this group: they probably already added one song for this period."}});

        const [track, trackCreated] = await Track.findOrCreate({
            where: {
                youtubeLink: youtubeLink,
            },
            defaults: {
                title: title
            }
        });

        await group.addTrack(track);

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


        if (group.status != GroupStatus.SUN_WAITING_THEME)
            return res.status(403).json({error: {message: `Wrong status for setting theme (${group.status})`}})

        if ((await group.getChosenUser()).id != user.id)
            return res.status(403).json({error: {message: `Only chosen user can set a theme !`}});

        await group.update({
            theme: theme,
            status: GroupStatus.SUN_DONE_THEME
        });

        return res.status(200).json({data: group});
    })
}
