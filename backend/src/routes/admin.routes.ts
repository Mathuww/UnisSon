import { Router } from "express";
import { generalPollingTask } from "../tasks/generalpolling.js";
import { startNewWeekCycle } from "../tasks/newcycle.js";

const router = Router();

router.post('/poll', async (req, res) => {
    console.log("[Polled by manual API call]");
    generalPollingTask();
});

router.post('/newcycle', async (req, res) => {
    console.log("[New week cycle triggered by manual API call]");
    startNewWeekCycle();
})

export default router;