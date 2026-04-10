import { NextFunction, RequestHandler } from "express";
import pool from "../dbpool.js";
import { PoolConnection } from "mariadb/*";
import jwt from 'jsonwebtoken';
import { logger } from "./logger.js";
import User from "../models/userModel.js";

export const authMiddleware: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(' ')[1]; // Partie après 'Bearer '

    if (!token)
        return res.status(401).json({message: "Missing JWT from protected API request"});

    let userId;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || "");
        logger.info("JWT is valid");
        logger.info(payload);
        logger.info("User ID carried by token : ", payload.sub);
        userId = Number(payload.sub);
    } catch (err) {
        logger.info("JWT is invalid :", err);
        return res.status(403).json({message: "Invalid or expired JWT"});
    }

    try {
        const user = await User.findByPk(userId);
        if (!user)
            return res.status(404).json({message: `User ${userId} does not exist in database`});

        (req as any).user = user;
        next();
    } catch (error) {
        logger.error("Auth middleware error : ", error);
        res.status(500).json({message: "Internal server error while authenticating"});
    }
}