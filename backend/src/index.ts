import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import nodeCron from 'node-cron';
import { authMiddleware } from './middleware/auth.js';
import { logger } from './middleware/logger.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import groupsRoutes from './routes/groups.routes.js';
import usersRoutes from './routes/users.routes.js';
import { startNewWeekCycle } from './tasks/newcycle.js';
import { generalPollingTask } from './tasks/generalpolling.js';

const app = express();
const port = process.env.PORT || 5175;

// Middlewares
app.use(express.json());
app.use(logger);
app.use(cors());
 
// Routes API
app.use('/auth', authRoutes);
app.use('/groups', authMiddleware, groupsRoutes);
app.use('/users', authMiddleware, usersRoutes);
app.use('/admin', adminRoutes);

// Setup CRON
nodeCron.schedule('0 0 * * SUN', () => { // Tous les dimanches à 00:00
  startNewWeekCycle();
});
nodeCron.schedule('* * * * *', () => { // Tous les dimanches à 00:00
  generalPollingTask();
});

// On écoute
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});