import pool from "../dbpool.js";
import { GroupStatus } from "../types.d.js";

export async function submissionMode() {
    logger.info("[POLL] Switching every group to submission mode.");

    let conn;
    try {
        conn = await pool.getConnection();

        await conn.query(
            `UPDATE Groups
            SET status = ?`,
            [GroupStatus.WK_WAITING_SUB]
        );
    } catch (err) {
        logger.info("SQL error : " + err);
    } finally {
        conn?.release();
    }
}