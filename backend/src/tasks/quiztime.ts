import pool from "../dbpool.js";
import { logger } from "../middleware/logger.js";
import Group from "../models/groupModel.js";
import { GroupStatus } from "../types.d.js";

export async function quiztimeMode() {
    logger.info("[POLL] Switching every group to quiz time mode.");

    try {
        const [affectedRowsNb] = await Group.update(
            { status : GroupStatus.SAT_WAITING_QUIZ },
            { where: {} }
        );
        logger.info(`${affectedRowsNb} groups set to quiz time`);
    } catch (err) {
        logger.info("DB error : " + err);
    } 
}