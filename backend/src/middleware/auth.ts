import { NextFunction, RequestHandler } from "express";
import pool from "../dbpool.js";
import { PoolConnection } from "mariadb/*";

export const authMiddleware: RequestHandler = async (req, res, next) => {
    const userId = Number(req.headers["x-user-id"]);

    if(!userId) {
        return res.status(400).send("User ID not specified");
    }

    let conn : PoolConnection | undefined;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query("SELECT id FROM Users WHERE id = ? LIMIT 1", [userId]);
        if (rows.length === 0) {
            return res.status(401).send("User ID not found");
        }

        (req as any).user = {id : userId};
        next();
    } catch (error) {
        console.error("Auth middleware error : ", error);
        res.status(500).send("Internal server error while authenticating");
    } finally {
        if (conn)
            conn.release();
    }
}