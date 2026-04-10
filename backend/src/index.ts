import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import nodeCron from 'node-cron';
import { authMiddleware } from './middleware/auth.js';
import { logger, loggerMiddleware } from './middleware/logger.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import groupsRoutes from './routes/groups.routes.js';
import usersRoutes from './routes/users.routes.js';
import { startNewWeekCycle } from './tasks/newcycle.js';
import { generalPollingTask } from './tasks/generalpolling.js';
import { submissionMode } from './tasks/submissionmode.js';
import { quiztimeMode } from './tasks/quiztime.js';
import { errorHandler } from './middleware/error.js';
import { dbConnect } from './dbconnect.js';

await dbConnect();

const app = express();
const port = process.env.PORT || 5175;

// Middlewares
app.use(express.json());
app.use(loggerMiddleware);
app.use(cors());

// Routes API
app.use('/auth', authRoutes);
app.use('/groups', authMiddleware, groupsRoutes);
app.use('/users', authMiddleware, usersRoutes);
app.use('/admin', adminRoutes);

// Error handler
app.use(errorHandler);

// Setup CRON
nodeCron.schedule('0 0 * * SUN', async () => { // Tous les dimanches à 00:00
  await startNewWeekCycle();
});
nodeCron.schedule('0 0 * * MON', async () => { // Tous les lundis à 00:00
  await submissionMode();
});
nodeCron.schedule('0 0 * * SAT', async () => { // Tous les lundis à 00:00
  await quiztimeMode();
});
nodeCron.schedule('* * * * *', async () => { // Tous les dimanches à 00:00
  await generalPollingTask();
});

// On écoute
app.listen(port, () => {
    logger.info(`Listening on ${port}`);
});