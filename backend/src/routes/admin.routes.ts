import { Router } from "express";
import { generalPollingTask } from "../tasks/generalpolling.js";
import { startNewWeekCycle } from "../tasks/newcycle.js";
import { submissionMode } from "../tasks/submissionmode.js";
import { quiztimeMode } from "../tasks/quiztime.js";

const router = Router();

router.post('/poll', async (req, res) => {
    console.log("[Polled by manual API call]");
    generalPollingTask();
});

router.post('/newcycle', async (req, res) => {
    console.log("[New week cycle triggered by manual API call]");
    startNewWeekCycle();
})

router.post('/submode', async (req, res) => {
    console.log("[Submission mode triggered for all groups by manual API call]");
    submissionMode();
})

router.post('/quiztime', async (req, res) => {
    console.log("[Quiz time mode triggered for all groups by manual API call]");
    quiztimeMode();
})


export default router;