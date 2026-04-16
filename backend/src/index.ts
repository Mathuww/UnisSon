import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import nodeCron from 'node-cron';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';
import { logger, loggerMiddleware } from './middleware/logger.js';
import adminRoutes from './routes/api/admin.routes.js';
import authRoutes from './routes/api/auth.routes.js';
import groupsRoutes from './routes/api/groups.routes.js';
import usersRoutes from './routes/api/users.routes.js';
import inviteRoutes from './routes/api/invites.routes.js';
import joinRoutes from './routes/web/invites.routes.js';
import { dbConnect } from './shared/dbconnect.js';
import { startNewWeekCycle } from './tasks/newcycle.task.js';

import { generalPollingTask } from './tasks/polling.task.js';
import { quiztimeMode } from './tasks/quiztime.task.js';
import http from 'http';
import { Server } from "socket.io";
await dbConnect();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5175;

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  logger.log("connected:", socket.id);

  socket.on("message", (data) => {
    logger.log("msg:", data);

    socket.emit("message", {
      text: "Hello client"
    });
  });
});

// Middlewares
app.use(loggerMiddleware);
app.use(express.json());
app.use(cors());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/groups', authMiddleware, groupsRoutes);
app.use('/api/join', authMiddleware, inviteRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/admin', adminRoutes);

// Templates (EJS)
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Web
app.use('/join', joinRoutes);

// Error handler
app.use(errorHandler);

// Setup CRON

// Tous les dimanches à 00:00
nodeCron.schedule('0 0 * * SUN', async () => { 
  await startNewWeekCycle();
});

// Tous les lundis à 00:00
nodeCron.schedule('0 0 * * SAT', async () => {
  await quiztimeMode();
});

// Tous les dimanches à 00:00
nodeCron.schedule('* * * * *', async () => { 
  await generalPollingTask();
});

// On écoute
server.listen(port, () => {
    logger.info(`Listening on ${port}`);
});