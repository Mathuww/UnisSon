import { Request, Response, Router } from "express";
import pool from "../dbpool.js";
import { asyncHandler } from "../middleware/error.js";
import { logger } from "../middleware/logger.js";
import User from "../models/userModel.js";

export const UserController = {
    getGroups: asyncHandler( async (req: Request, res: Response) => {
        const user: User  = (req as any).user;
        const groups = user.getGroups();
        return res.status(200).json(groups);
    })
}
