import { Pool, PoolConnection } from "mariadb/*";

// Obtenir tous les groupes
export async function getAllGroups (conn: PoolConnection) {
    const rows = await conn.query(
        "SELECT * FROM Groups"
    );

    return rows;
}

// Obtenir toutes les relations groupes/utilisateurs 
// dans le format { "ID": { chosenOne: 5, members: [5, 8, 10] } }
export async function getAllGroupsData(conn: PoolConnection) {
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

export async function checkGroupStatus(conn: PoolConnection, groupId: number) {
    const rows = await conn.query(
        "SELECT status FROM groups WHERE id = ?",
        [groupId]
    );

    if (rows.length > 0)
        return rows[0].status;
    return undefined;
}

export async function checkChosenOne(conn: PoolConnection, groupId: number) {
    const rows = await conn.query(
        "SELECT choosenOneUserID FROM Groups WHERE id = ?",
        [groupId]
    );
    if (rows.length > 0)
        return rows[0].choosenOneUserID;
    return undefined;
}