import pool from "../dbpool.js";
import { GroupStatus } from "../types.d.js";

export async function quiztimeMode() {
    logger.info("[POLL] Switching every group to quiz time mode.");

    let conn;
    try {
        conn = await pool.getConnection();

        await conn.query(
            `UPDATE Groups
            SET status = ?`,
            [GroupStatus.SAT_WAITING_QUIZ]
        );
    } catch (err) {
        logger.info("SQL error : " + err);
    } finally {
        conn?.release();
    }
}