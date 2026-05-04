import { Request, Response, Router } from "express";
import pool from "../../shared/db.js";
import { asyncHandler } from "../../middleware/error.js";
import { logger } from "../../middleware/logger.js";
import User from "../../models/elem/User.model.js";

/**
 * Contrôleur pour les routes liées à un utilisateur.
 */
export const UserController = {
    /**
     * Renvoie les infos d'un utilisateur
     */
    getProfile: asyncHandler( async (req: Request, res: Response) => {
        const user: User  = (req as any).user;
        return res.status(200).json({data: user});
    }),
    /**
     * Renvoie les groupes auxquels l'user appartient
     */
    getGroups: asyncHandler( async (req: Request, res: Response) => {
        const user: User  = (req as any).user;
        logger.info("in GetGroups");
        logger.info(user);
        const groups = await user.getGroups();
        return res.status(200).json({data: groups});
    })
}
