import { Request, Response, Router } from "express";
import pool from "../dbpool.js";

const router = Router();

// /auth/login
router.post('/login', async (req: Request, res: Response) => {
    const nickname = req.body.nickname;

    if (!nickname)
        return res.status(400).json({message: "Nickname missing from login request"});

    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            "SELECT id FROM Users WHERE nickname = ? LIMIT 1",
            [nickname]
        );

        if (rows.length > 0) {
            res.json({id: rows[0].id});
        } else {
            res.status(404).json({error: "User not found"});
        }
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).json({error: "Error while fetching data from DB"});
    } finally {
        if (conn)
            conn.release();
    }
});

// /auth/signup
router.post('/signup', async (req, res) => {
    const nickname = req.body.nickname;

    if (!nickname)
        return res.status(400).json({error: "Nickname missing from signup request"});

    const email = req.body.email;
    if (!email)
        return res.status(400).json({error: "Email missing from signup request"});

    let conn;
    try {
        conn = await pool.getConnection();

        const result = await conn.query(
            "INSERT INTO Users (nickname, email) VALUES (?, ?)",
            [nickname, email]
        );

        res.json({id: Number(result.insertId)});
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).json({message: "Error while fetching data from DB"});
    } finally {
        if (conn)
            conn.release();
    }
});

export default router;