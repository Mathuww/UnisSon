import { Request, Response, Router } from "express";
import pool from "../dbpool.js";

const router = Router();

// /auth/login
router.post('/login', async (req: Request, res: Response) => {
    const nickname = req.body.nickname;

    if (!nickname)
        return res.status(401).send("Nickname missing from login request");

    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            "SELECT id FROM Users WHERE nickname = ? LIMIT 1",
            [nickname]
        );

        res.send(`User created with ID ${result.insertId}`);
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).send("Error while fetching data from DB");
    } finally {
        if (conn)
            conn.release();
    }
});

// /auth/signup
router.post('/signup', async (req, res) => {
    const nickname = req.body.nickname;

    if (!nickname)
        return res.status(401).send("Nickname missing from signup request");

    let conn;
    try {
        conn = await pool.getConnection();

        const [result] = await conn.query(
            "INSERT INTO Users (nickname) VALUES (?)",
            [nickname]
        );

        res.send(`User created with ID ${result.insertId}`);
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).send("Error while fetching data from DB");
    } finally {
        if (conn)
            conn.release();
    }
});

export default router;