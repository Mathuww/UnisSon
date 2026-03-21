import pool from "../dbpool.js";
import { GroupStatus } from "../types.d.js";

export async function quiztimeMode() {
    console.log("[POLL] Switching every group to quiz time mode.");

    let conn;
    try {
        conn = await pool.getConnection();

        await conn.query(
            `UPDATE Groups
            SET status = ?`,
            [GroupStatus.QUIZ_TIME]
        );
    } catch (err) {
        console.log("SQL error : " + err);
    } finally {
        conn?.release();
    }
}