import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/error.js";
import Invite from "../../models/logic/Invite.model.js";
import { Op } from "sequelize";
import { TimeManager } from "../../shared/TimeManager.js";

export const INVITE_EXPIRE_DELAY_HOURS = 24; // lien invite : 24 heures 
// Si une invite existe deja pr cet user et ce groupe et date de < x mn,
// on renvoie le meme token, sinon on fait un nv token
export const INVITE_DELAY_BEFORE_NEW_TOKEN = 30; 

export const InviteController = {
    // Sécurisé par les middleware d'auth et groupCheck
    // (Seule route de groupe qui est pas dans groups)
    invite: asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        const group = (req as any).group;

        const inviteToken = crypto.randomUUID();
        const today = TimeManager.now();

        const maxDateBeforeNew = new Date(today);
        maxDateBeforeNew.setMinutes(today.getMinutes() + INVITE_DELAY_BEFORE_NEW_TOKEN);
        const existing = await Invite.findOne({
            where: {
                groupID: group.id,
                inviterUserID: user.id,
                updatedAt: { [Op.lte] : maxDateBeforeNew },
                expiresAt: { [Op.gte]: TimeManager.now() } 
            }
        });

        if (existing) {
            return res.status(200).json({data: {token: existing.token}});
        } else {
            const expireDate = new Date(today);
            expireDate.setHours(today.getHours() + INVITE_EXPIRE_DELAY_HOURS);

            const newInvite = await Invite.create({
                groupID: group.id,
                inviterUserID: user.id,
                token: inviteToken,
                expiresAt: expireDate
            });

            return res.status(201).json({data: {token: newInvite.token}});
        }
    }),
    tokenInfo: asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;

        const token = req.params.token;
        if (!token)
            return res.status(400).json({error: {message: "Missing token from token info request"}});

        const invite = await Invite.findOne({
            where: {
                token: token
            }
        });

        if (!invite)
            return res.status(404).json({error: {message: "Invite not found"}});

        if (invite.expiresAt <= TimeManager.now())
            return res.status(410).json({error: {message: "Invite expired"}});

        const group = await invite.getGroup();
        const members = await group.getUsers();
        const inviter = await invite.getInviterUser();
        const isAskerInGroup = await group.isUserInGroup(user.id);

        const data = {
            group: {
                id: group.id,
                name: group.name,
                users: members
            },
            inviter: {
                id: inviter.id,
                nickname: inviter.nickname
            },
            isUserInGroup: isAskerInGroup
        };
        console.log("asking for invite info, sending :");
        console.log(data);
        return res.status(200).json({data: data});
    }),
    join: asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;

        const token = req.params.token;
        if (!token)
            return res.status(400).json({error: {message: "Missing token from join request"}});

        const invite = await Invite.findOne({
            where: {
                token: token
            }
        });

        if (!invite)
            return res.status(404).json({error: {message: "Invite not found"}});

        if (invite.expiresAt <= TimeManager.now())
            return res.status(410).json({error: {message: "Invite expired"}});

        const group = await invite.getGroup();
        console.log(group);
        console.log(user);
        await group.addUser(user.id, {
            through: {
                notifPending: false,
                weeklyScore: 0,
                globalScore: 0
            }
        });

        return res.status(201).json({data: group});
    })
}