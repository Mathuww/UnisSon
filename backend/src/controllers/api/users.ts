import { Request, Response, Router } from "express";
import pool from "../../shared/db.js";
import { asyncHandler } from "../../middleware/error.js";
import { logger } from "../../middleware/logger.js";
import User from "../../models/elem/User.model.js";

export const UserController = {
    getProfile: asyncHandler( async (req: Request, res: Response) => {
        const user: User  = (req as any).user;
        return res.status(200).json({data: user});
    }),
    getGroups: asyncHandler( async (req: Request, res: Response) => {
        const user: User  = (req as any).user;
        logger.info("in GetGroups");
        logger.info(user);
        const groups = await user.getGroups();
        return res.status(200).json({data: groups});
    })
}
