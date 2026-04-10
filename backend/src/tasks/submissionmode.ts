import pool from "../dbpool.js";
import { logger } from "../middleware/logger.js";
import Group from "../models/groupModel.js";
import { GroupStatus } from "../types.d.js";

export async function submissionMode() {
    logger.info("[POLL] Switching every group to submission mode.");

    try {
        const [affectedRowsNb] = await Group.update(
            { status: GroupStatus.WK_WAITING_SUB },
            { where: {} }
        );
        logger.info(`${affectedRowsNb} groups set to sub mode`);
    } catch (err) {
        logger.info("DB error : " + err);
    }
}