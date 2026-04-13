import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { logger } from '../middleware/logger.js';

const db = new Sequelize(`mariadb://${process.env.DB_USER}:${process.env.DB_PASSWD}@${process.env.DB_HOST}/${process.env.DB_DBNAME}`,
    {
        dialect: 'mariadb',
        logging: (sql: string) => logger.debug(`Running SQL query ${sql}`)
    }
);
export default db;