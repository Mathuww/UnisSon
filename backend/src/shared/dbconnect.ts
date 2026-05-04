import db from "./db.js"
import { logger } from "../middleware/logger.js";
import '../models/index.js';

export const dbConnect = async () => {
    try {
        await db.authenticate();
        logger.info("DB connetced !");

        // Remplacer par la ligne avec alter: true pour MAJ la DB
        //await db.sync({alter: true});
        await db.sync();
        logger.info("DB synced!");
    } catch (err) {
        console.error('DB connection failed:', err);
        process.exit(1);
    }
}