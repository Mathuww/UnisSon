import { logger } from "../middleware/logger.js";

export async function generalPollingTask() {
    logger.info("[POLL] Running general polling task.");
}