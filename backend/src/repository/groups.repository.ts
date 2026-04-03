import { Pool, PoolConnection } from "mariadb/*";

export class GroupRepository {
    static async createGroup (conn: PoolConnection, groupName: string) {
        return await conn.query(
            "INSERT INTO Groups (name) VALUES (?)",
            [groupName]
        );
    }

    static async addUserToGroup (conn: PoolConnection, groupId: number, userId: string) {
        return await conn.query(
            "INSERT INTO GroupsUsers (groupId, userId) VALUES (?, ?)",
            [groupId, userId]
        );
    }

    static async getGroupData (conn: PoolConnection) {
        const rows = await conn.query(
            "SELECT * FROM Groups"
        );

        return rows;
    }

    // Obtenir tous les groupes
    static async getAllGroups (conn: PoolConnection) {
        const rows = await conn.query(
            "SELECT * FROM Groups"
        );

        return rows;
    }

    // Obtenir toutes les relations groupes/utilisateurs 
    // dans le format { "ID": { chosenOne: 5, members: [5, 8, 10] } }
    static async getAllGroupsData(conn: PoolConnection) {
        const rows = await conn.query(`
            SELECT 
                g.id as groupID, 
                g.choosenOneUserID, 
                gu.userID
            FROM Groups g
            LEFT JOIN GroupsUsers gu ON g.id = gu.groupID
        `) as any[];

        // On réduit 
        return rows.reduce((acc, row) => {
            if (!acc[row.groupID]) {
                acc[row.groupID] = { 
                    chosenOne: row.choosenOneUserID, 
                    members: [] 
                };
            }
            if (row.userID) acc[row.groupID].members.push(row.userID);
            return acc;
        }, {});
    }

    static async getStatus(conn: PoolConnection, groupId: number) {
        const rows = await conn.query(
            "SELECT status FROM groups WHERE id = ?",
            [groupId]
        );

        if (rows.length > 0)
            return rows[0].status;
        return undefined;
    }

    static async getChosenOne(conn: PoolConnection, groupId: number) {
        const rows = await conn.query(
            "SELECT choosenOneUserID FROM Groups WHERE id = ?",
            [groupId]
        );
        if (rows.length > 0)
            return rows[0].choosenOneUserID;
        return undefined;
    }
}