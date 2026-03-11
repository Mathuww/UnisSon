import { Router } from "express";
import pool from "../dbpool.js";

const router = Router();

// /text/... 
router.post('', async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            "SELECT testfield FROM test LIMIT 1"
        );

        if (rows.length > 0) {
            const testfield = rows[0].testfield;
            res.send(`The test field is ${testfield}`);
        } else {
            res.send("The table test is empty");
        }
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).send("Error while fetching data from DB");
    } finally {
        if (conn)
            conn.release();
    }
});

export default router;