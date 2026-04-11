import { logger } from "../middleware/logger.js";
import Group from "../models/elem/Group.model.js";
import type { GroupStatus } from "../types.d.ts";

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