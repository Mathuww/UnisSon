import 'dotenv/config';

import { dbConnect } from './shared/dbconnect.js';
import { TimeManager } from './shared/TimeManager.js';

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

import http from 'http';
import { timeInfoMiddleware } from './middleware/timeinfo.js';

import nodeCron from 'node-cron';
import { initSocket } from './shared/socket.js';
import { generalPollingTask } from './tasks/polling.task.js';


// Se connecter et synchroniser la DB
await dbConnect();
// Récupérer le dernier temps serveur dans la DB
await TimeManager.init();

// Création du serveur HTTP
const app = express();
const server = http.createServer(app);

// Création du serveur WebSocket
const io = initSocket(server);

io.on("connection", (socket) => {
    logger.info("connected:" + socket.id);

    // Ajouter du logging au socket.emit
    const originalEmit = socket.emit.bind(socket);

    socket.emit = (event: string, ...args: any[]) => {
        logger.info(`[socket] emit : ${event}`, args);
        return originalEmit(event, ...args);
    };

    // Gérer les rooms
    // Rooms par groupe
    socket.on("join:group", ({ groupId }) => {
        socket.join(`group:${groupId}`);
        logger.info(`socket ${socket.id} joined room for group ${groupId}`);
    });

    socket.on("leave:group", ({ groupId }) => {
        socket.leave(`group:${groupId}`);
        logger.info(`socket ${socket.id} left room for group ${groupId}`);
    });

    // Rooms par use
    socket.on("join:user", ({ userId }) => {
        socket.join(`user:${userId}`);
        logger.info(`socket ${socket.id} joined room for user ${userId}`);
    });

    socket.on("leave:user", ({ userId }) => {
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
nodeCron.schedule('* * * * *', async () => {
    await generalPollingTask();
    io.emit(`simulation:timeChange`);
});

// On écoute
const port = process.env.PORT || 5175;
server.listen(port, () => {
    logger.info(`Listening on ${port}`);
});