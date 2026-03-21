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
            JOIN GroupsUsers gu ON g.id = gu.groupID 
            WHERE gu.userID = ?`,
            [user.id]
        );
 
        console.log(groups);

        if (groups.length > 0) {
            res.json(groups);
        } else {
            res.status(404).json({error: "User does not belong to any group"});
        }
     } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).json({error: "Error while fetching data from DB"});
    } finally {
        if (conn)
            conn.release();
    }
});



export default router;