import { NextFunction, RequestHandler } from "express";
import pool from "../dbpool.js";
import { PoolConnection } from "mariadb/*";
import jwt from 'jsonwebtoken';
import { logger } from "./logger.js";

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

    let conn : PoolConnection | undefined;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query("SELECT id FROM Users WHERE id = ? LIMIT 1", [userId]);
        if (rows.length === 0) {
            logger.error("User ID not found in DB");
            return res.status(401).json({message: "User ID not found"});
        }

        (req as any).user = {id : userId};
        next();
    } catch (error) {
        logger.error("Auth middleware error : ", error);
        res.status(500).json({message: "Internal server error while authenticating"});
    } finally {
        if (conn)
            conn.release();
    }
}