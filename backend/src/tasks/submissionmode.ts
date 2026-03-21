import pool from "../dbpool.js";
import { GroupStatus } from "../types.d.js";

export async function submissionMode() {
    console.log("[POLL] Switching every group to submission mode.");

    let conn;
    try {
        conn = await pool.getConnection();

        await conn.query(
            `UPDATE Groups
            SET status = ?`,
            [GroupStatus.SUBMISSION]
        );
    } catch (err) {
        console.log("SQL error : " + err);
    } finally {
        conn?.release();
    }
}