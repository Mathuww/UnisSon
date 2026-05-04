import { asyncHandler } from "../../middleware/error.js";
import Invite from "../../models/logic/Invite.model.js";
import { TimeManager } from "../../shared/TimeManager.js";

/**
 * Contrôleur non lié aux route API,
 * mais servant les pages web /join/ et /join/token/.
 * Utilise des templates EJS pour servir des pages dynamiques.
 */
export const JoinController = {
    /**
     * En cas de token manquant.
     */
    incomplete: asyncHandler(async (req, res, next) => {
        return res.status(400).render("join/incomplete", {error: "Missing token from join request URL"});
    }),
    /**
     * Récupère les données en DB et sert la page dynamique /join/{token},
     * ou alors la page "incomplete"
     */
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

        if (invite.expiresAt <= TimeManager.now())
            return res.status(400).render("join/incomplete", {error: "Invite expired" });

        const group = await invite.getGroup();

        return res.status(200).render("join/join", {
            token: token,
            groupName: group.name
        });
    })
}