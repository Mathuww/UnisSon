import 'dotenv/config';
import { Sequelize } from 'sequelize';

const dbName = process.env.NODE_ENV === 'test' ? 'asyna_test' : process.env.DB_NAME;

const db = new Sequelize(`mariadb://${process.env.DB_USER}:${process.env.DB_PASSWD}@${process.env.DB_HOST}/${dbName}`,
    {
        dialect: 'mariadb',
        logging: false, //(sql: string) => logger.debug(`Running SQL query ${sql}`),
        pool: {
            max: 10
        }
    }
);
export default db;