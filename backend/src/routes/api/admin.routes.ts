import { Router } from "express";
import { logger } from "../../middleware/logger.js";
import { generalPollingTask } from "../../tasks/polling.task.js";
import { TimeManager } from "../../shared/TimeManager.js";

const router = Router();

router.post('/poll', async (req, res) => {
    try {
        logger.info("[Polled by manual API call]");
        await generalPollingTask();
        return res.status(204);
    } catch (e) {
        logger.error("Manual poll error", { e });
        return res.status(500);
    }
});

router.get('/time', async (req, res) => {
    return res.status(200).json({data: {serverTime: TimeManager.now().toISOString()}})
});

router.post('/time/forward', async (req, res) => {
    try {
        const { hrs } = req.body;
        if (!hrs)
            return res.status(400).json({ error: { message: "Missing time offset" } });

        await TimeManager.forward(hrs);
        logger.info(`Forwarded of ${hrs} hours`);
        return res.status(200).json({message: "Time forwarded", hrs: hrs});
    } catch (err) {
        logger.error("Time forward error", { err });
        return res.status(500);
    }
})


export default router;