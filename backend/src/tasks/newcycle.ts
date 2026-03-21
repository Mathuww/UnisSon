import { PoolConnection } from "mariadb/*";
import pool from "../dbpool.js";
import { getAllGroupsData } from "../helpers/groups.js";
import { GroupData, GroupStatus } from "../types.d.js";

/*
Le but de cette fonction
est de choisir l'élu.e de la semaine suivante.

Cette tâche est censée être run par cron
le dimanche à minuit.

Penser à donner un nom plus explicite. 
*/
export async function startNewWeekCycle() {
    console.log("[POLL] Updating the chosen one for every group.");
    // on setup la connection à la DB
    let conn: PoolConnection | undefined;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // On récup. la liste de toutes les relations groupes/utilisateurs
        const groupsUsersRel: Record<string, GroupData> = await getAllGroupsData(conn);
        
        // Pour chaque groupe
        for (const [groupID, data] of Object.entries(groupsUsersRel)) {
            if (!conn) return;

            // Là on a la liste des utilisateurs dans ce groupe.
            // Du coup on veut choisir le suivant de celui qui était chosen one avant
            // (ou un au hasard si le group est tout neuf)

            // Qui était le chosen one avant ?
            const prevChosenOne: number | null = groupsUsersRel[groupID].chosenOne;

            const usersInGroup = groupsUsersRel[groupID].members;

            let nextChosenOne;
            if (prevChosenOne) {
                // On choisit le suivant par roulement
                const prevChosenOneIndex = usersInGroup.indexOf(prevChosenOne);
                let nextChosenOneIndex = (prevChosenOneIndex + 1) % (usersInGroup.length);
                nextChosenOne = usersInGroup[nextChosenOneIndex];
            } else { // premier élu
                // full random
                nextChosenOne = usersInGroup[Math.floor(Math.random() * usersInGroup.length)];
            }

            console.log(`[POLL] Updating chosen one for group ${groupID} to user ${nextChosenOne}`);

            // mtn on doit faire la MAJ dans la DB
            const updateResult = await conn.query(
                `UPDATE Groups
                SET choosenOneUserId = ?,
                status = ?
                WHERE id = ?`,
                [nextChosenOne, GroupStatus.WAITING_FOR_THEME, groupID]
            );

            await conn.commit();
        }
    } catch (err) {
        console.log("sql error : " + err);
        conn?.rollback();
    } finally {
        conn?.release();
    }
}