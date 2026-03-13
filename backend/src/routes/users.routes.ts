import { Response, Router } from "express";
import pool from "../dbpool.js";
import { authMiddleware } from "../middleware/auth.js";
import { User } from "../types.js";

const router = Router();

// /users/...

// /users/me/groups
router.get('/me/groups', async (req, res) => {
    const user : User = (req as any).user;

    let conn;
    try {
        conn = await pool.getConnection();

        const groups = await conn.query(
            `SELECT g.id, g.name 
            FROM Groups g
            JOIN GroupUsers gu ON g.id = gu.id 
            WHERE gu.userId = ?`,
            [user.id]
        );

        if (groups.length > 0) {
            res.json(groups);
        } else {
            res.status(404).send("User does not belong to any group");
        }
    }
});



export default router;