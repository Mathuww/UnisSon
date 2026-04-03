import { PoolConnection } from "mariadb/*";

export class UserRepository {
    static async findUserByEmail (conn: PoolConnection, email: string) {
        const rows = await conn.query(
            "SELECT id FROM Users WHERE email = ? LIMIT 1",
            [email]
        );
        if (rows.length > 0)
            return rows[0].id;
        return undefined;
    }
    
    static async createUser (conn: PoolConnection, email: string, nickname: string, googleId: string) {
        const result = await conn.query(
            "INSERT INTO Users (email, nickname, providerLoginID) VALUES (?,?,?)",
            [email, nickname, googleId]
        );
        return Number(result.insertId);
    }
}