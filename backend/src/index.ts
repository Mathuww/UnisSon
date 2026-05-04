import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';
import { logger, loggerMiddleware } from './middleware/logger.js';
import adminRoutes from './routes/api/admin.routes.js';
import authRoutes from './routes/api/auth.routes.js';
import groupsRoutes from './routes/api/groups.routes.js';
import inviteRoutes from './routes/api/invites.routes.js';
import usersRoutes from './routes/api/users.routes.js';
import joinRoutes from './routes/web/invites.routes.js';
import { dbConnect } from './shared/dbconnect.js';

import http from 'http';
import { Server } from "socket.io";
import { timeInfoMiddleware } from './middleware/timeinfo.js';
import { TimeManager } from './shared/TimeManager.js';
import { initSocket } from './shared/socket.js';
await dbConnect();
await TimeManager.init();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5175;

const io = initSocket(server);

io.on("connection", (socket) => {
  logger.info("connected:" + socket.id);

  const originalEmit = socket.emit.bind(socket);

  socket.emit = (event: string, ...args: any[]) => {
    logger.info(`[socket] emit : ${event}`, args);
    return originalEmit(event, ...args);
  };

  socket.on("join:group", ({groupId}) => {
    socket.join(`group:${groupId}`);
    logger.info(`socket ${socket.id} joined room for group ${groupId}`);
  });

  socket.on("leave:group", ({groupId}) => {
    socket.leave(`group:${groupId}`);
    logger.info(`socket ${socket.id} left room for group ${groupId}`);
  });

  socket.on("join:user", ({userId}) => {
    socket.join(`user:${userId}`);
    logger.info(`socket ${socket.id} joined room for user ${userId}`);
  });

  socket.on("leave:user", ({userId}) => {
    socket.leave(`user:${userId}`);
    logger.info(`socket ${socket.id} left room for user ${userId}`);
  });
});

// Middlewares
app.use(loggerMiddleware);
app.use(timeInfoMiddleware);
app.use(express.json());
app.use(cors());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/groups', authMiddleware, groupsRoutes);
app.use('/api/invites/', inviteRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Templates (EJS)
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Web
app.use('/join', joinRoutes);
app.use('/', express.static('static/'));

// Error handler
app.use(errorHandler);

// Setup CRON
/*
nodeCron.schedule('* * * * *', async () => { 
  await generalPollingTask();
});
*/

// On écoute
server.listen(port, () => {
    logger.info(`Listening on ${port}`);
});