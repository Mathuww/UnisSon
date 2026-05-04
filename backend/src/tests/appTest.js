import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import { authMiddleware } from '../middleware/auth.js';
import { errorHandler } from '../middleware/error.js';
import adminRoutes from '../routes/api/admin.routes.js';
import authRoutes from '../routes/api/auth.routes.js';
import groupsRoutes from '../routes/api/groups.routes.js';
import inviteRoutes from '../routes/api/invites.routes.js';
import usersRoutes from '../routes/api/users.routes.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/groups', authMiddleware, groupsRoutes);
app.use('/api/invites/', inviteRoutes);
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Error handler
app.use(errorHandler);
export default app;