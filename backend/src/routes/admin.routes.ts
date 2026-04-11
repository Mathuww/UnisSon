import { Router } from "express";
import { generalPollingTask } from "../tasks/polling.task.js";
import { startNewWeekCycle } from "../tasks/newcycle.task.js";
import { submissionMode } from "../tasks/submissionmode.js";
import { quiztimeMode } from "../tasks/quiztime.task.js";
import { logger } from "../middleware/logger.js";

const router = Router();

router.post('/poll', async (req, res) => {
    if (!process.env.DEV_MODE)
            return res.status(403);

    logger.info("[Polled by manual API call]");
    generalPollingTask();
});

router.post('/newcycle', async (req, res) => {
    if (!process.env.DEV_MODE)
            return res.status(403);

    logger.info("[New week cycle triggered by manual API call]");
    startNewWeekCycle();
})

router.post('/submode', async (req, res) => {
    if (!process.env.DEV_MODE)
            return res.status(403);

    logger.info("[Submission mode triggered for all groups by manual API call]");
    submissionMode();
})

router.post('/quiztime', async (req, res) => {
    if (!process.env.DEV_MODE)
            return res.status(403);

    logger.info("[Quiz time mode triggered for all groups by manual API call]");
    quiztimeMode();
})


export default router;