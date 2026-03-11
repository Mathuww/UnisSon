import { createPool } from 'mariadb';
import 'dotenv/config';

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWD,
    database: process.env.DB_DBNAME,
    connectionLimit: 5
});
export default pool;