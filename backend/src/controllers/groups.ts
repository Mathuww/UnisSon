import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.js";
import { logger } from "../middleware/logger.js";
import Group from "../models/elem/Group.model.js";
import Track from "../models/elem/Track.model.js";
import { GroupStatus } from "../types.d.js";
import User from "../models/elem/User.model.js";

export const GroupController = {
    createGroup: asyncHandler( async (req: Request, res: Response) => {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({error: "Missing group name from group create request"});

        const user : User = (req as any).user; 

        const group = await Group.create({name});

        await group.addUser(user.id, {
            through: {
                notifPending: false,
                weeklyScore: 0,
                globalScore: 0
            }
        });

        return res.status(201).json(group);
    }),
    getUsers: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const groupId = Number(req.params.id);

        if (!groupId)
            return res.status(400).json({error: "Missing group ID"});

        const group = await Group.findByPk(groupId);
        if (!group)
            return res.status(404).json({message: "Unable to find group"});

        const users = await group?.getUsers();

        return res.status(200).json(users);
    }),
    addUser: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const groupId = Number(req.params.id);

        if (!groupId)
            return res.status(400).json({error: "Missing group ID"});

        const group = await Group.findByPk(groupId);
        if (!group)
            return res.status(404).json({message: "Unable to find group"});

        await group?.addUser(user.id, {
            through: {
                notifPending: false,
                weeklyScore: 0,
                globalScore: 0
            }
        });

        return res.status(201).json(group);
    }),
    getTracks: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const groupId = Number(req.params.id);

        if (!groupId)
            return res.status(400).json({message: "Missing group ID"});

        const group = await Group.findByPk(groupId);
        if (!group)
            return res.status(404).json({message: "Unable to find group"});

        const tracks = group.getTracks();
        return res.status(200).json(tracks);
    }),
    addTrack: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const groupId = Number(req.params.id);
        const { title, youtubeLink } = req.body;

        if (!groupId)
            return res.status(400).json({message: "Missing group ID"});
        if (!title || !youtubeLink)
            return res.status(400).json({message: "Missing song data"});

        const group = await Group.findByPk(groupId);
        if (!group)
            return res.status(404).json({message: "Unable to find group"});

        if (group.status != GroupStatus.WK_WAITING_SUB)
            return res.status(403).json({message: `Wrong status for adding song (${group.status})`});

        if ((await group.getChosenUser()).id == user.id)
            return res.status(403).json({message: `Chosen user cant add a song !`});

        if (!(await group.canUserAdd(user.id)))
            return res.status(403).json({message: "This user cant add to this group: they probably already added one song for this period."});

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
            return res.status(201).json({message: "Track created and added", track: track});
        } else {
            logger.info("Track already existed, but was added to group : ", track);
            return res.status(200).json({message: "Track already existed, added to group", track: track});
        }
    }),
    setTheme: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        const groupId = Number(req.params.id);
        const { theme }  = req.body;

        if (!groupId)
            return res.status(400).json({message: "Missing group ID"});

        if (!theme)
            return res.status(400).json({message: "Missing theme for theme request"});

        const group = await Group.findByPk(groupId);
        if (!group)
            return res.status(404).json({message: "Unable to find group"});

        if (group.status != GroupStatus.SUN_WAITING_THEME)
            return res.status(403).json({message: `Wrong status for setting theme (${group.status})`})

        if ((await group.getChosenUser()).id != user.id)
            return res.status(403).json({message: `Only chosen user can set a theme !`});

        await group.update({
            theme: theme,
            status: GroupStatus.SUN_DONE_THEME
        });

        return res.status(200).json({message: "Theme updated"});
    })
}
