import db from "./db.js"
import { logger } from "../middleware/logger.js";
import '../models/index.js';

export const dbConnect = async () => {
    try {
        await db.authenticate();
        logger.info("DB connetced !");

        //await db.sync({force: true});
        await db.sync();
    } catch (err) {
        console.error('DB connection failed:', err);
        process.exit(1);
    }
}