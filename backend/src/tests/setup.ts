import db from '../shared/db.js';
import { TimeManager } from '../shared/TimeManager.js';
import { beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import '../models/index.js';

beforeAll(async () => {
    if (process.env.NODE_ENV !== "test") {
        throw new Error();
    }
    await db.authenticate();
    await db.sync({force: true});
    await TimeManager.init();
});

beforeEach(async () => {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.truncate({ cascade: true, restartIdentity: true });
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
});


afterEach(async () => {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.truncate({ cascade: true, restartIdentity: true });
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
});

afterAll(async () => {
    await db.close();
});