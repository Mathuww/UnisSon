import 'dotenv/config';
import express from 'express';

import { authMiddleware } from './middleware/auth.js';
import { logger } from './middleware/logger.js';
import authRoutes from './routes/auth.routes.js';
import testRoutes from './routes/test.routes.js';
import groupsRoutes from './routes/groups.routes.js'

const app = express();
const port = process.env.PORT || 5175;

app.use(express.json());
app.use(logger);
 
app.use('/auth', authRoutes);
app.use('/text', testRoutes);
app.use('/groups', authMiddleware, groupsRoutes);

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});