import { asyncHandler } from "../../middleware/error.js";
import Invite from "../../models/logic/Invite.model.js";

export const JoinController = {
    incomplete: asyncHandler(async (req, res, next) => {
        return res.status(400).render("join/incomplete", {error: "Missing token from join request URL"});
    }),
    join: asyncHandler(async (req, res, next) => {
        const token = req.params.token;
        if (!token)
            return res.status(400).render("join/incomplete", {error: "Missing token from join request URL"});

        const invite = await Invite.findOne({
            where: {
                token: token
            }
        });

        if (!invite)
            return res.status(400).render("join/incomplete", {error: "Invite not found" });

        if (invite.expiresAt <= new Date())
            return res.status(400).render("join/incomplete", {error: "Invite expired" });

        const group = await invite.getGroup();

        return res.status(200).render("join/join", {
            token: token,
            groupName: group.name
        });
    })
}