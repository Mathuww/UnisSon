import { createPool } from 'mariadb';
import 'dotenv/config';
import { Sequelize } from 'sequelize';
import { logger } from './middleware/logger.js';

/*
const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWD,
    database: process.env.DB_DBNAME,
    connectionLimit: 5
});
export default pool;
*/

const db = new Sequelize(`mariadb://${process.env.DB_USER}:${process.env.DB_PASSWD}@${process.env.DB_HOST}/${process.env.DB_DBNAME}`,
    {
        dialect: 'mariadb',
        logging: (sql: string) => logger.debug(`Running SQL query ${sql}`)
    }
);
export default db;