import { Response, Router } from "express";
import pool from "../dbpool.js";
import { AuthenticatedRequest, User } from "../types.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// /groups/... 

// /groups/
router.post('/', async (req, res) => {
    const groupName = req.body.groupName;
    if (!groupName)
        return res.status(400).send("Missing group name from group create request");

    const user : User = (req as any).user;

    let conn;
    try {
        conn = await pool.getConnection();

        await conn.beginTransaction();

        let result = await conn.query(
            "INSERT INTO Groups (name) VALUES (?)",
            [groupName]
        );

        const groupId = result.insertId;

        result = await conn.query(
            "INSERT INTO GroupUsers (groupId, userId) VALUES (?)",
            [groupId, user.id]
        );

        await conn.commit();

        res.json({groupId : groupId});
    } catch (error) {
        if (conn)
            conn.rollback();
        console.error("SQL error : ", error);
        res.status(500).send("Error while fetching data from DB");
    } finally {
        if (conn)
            conn.release();
    }
});

// GET /groups/:

// POST /groups/:id/members (ajt un membre)
router.post('/:id/members', async (req, res) => {
    const user : User = (req as any).user;
    const groupId = req.params.id;

    if (!groupId)
        return res.status(400).send("Missing group ID to join");

    let conn;
    try {
        conn = await pool.getConnection();

        const result = await conn.query(
            "INSERT INTO GroupUsers (groupId, userId) VALUES (?, ?)",
            [groupId, user.id]
        );

        res.send("User added to group");
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).send("Error while fetching data from DB");
    } finally {
        if (conn)
            conn.release();
    }
});

export default router;