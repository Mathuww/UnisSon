import db from "../dbpool.js";
import { logger } from "../middleware/logger.js";
import Group from "../models/groupModel.js";
import { GroupStatus } from "../types.d.js";

/*
Le but de cette fonction
est de choisir l'élu.e de la semaine suivante.

Cette tâche est censée être run par cron
le dimanche à minuit.

Penser à donner un nom plus explicite. 
*/
export async function startNewWeekCycle() {
    logger.info("[POLL] Updating the chosen one for every group.");
    const transaction = await db.transaction();
    try {
        const groups = await Group.findAll({transaction: transaction});
        
        // Pour chaque groupe
        for (const group of groups) {
            const members = await group.getUsers({transaction: transaction});
            if (!members.length) continue;

            // Là on a la liste des utilisateurs dans ce groupe.
            // Du coup on veut choisir le suivant de celui qui était chosen one avant
            // (ou un au hasard si le group est tout neuf)

            // Qui était le chosen one avant ?
            const prevChosenOne: number | null = group.chosenOneUserID;

            let nextChosenOne;
            if (prevChosenOne) {
                // On choisit le suivant par roulement
                const index = members.findIndex(u => u.id === prevChosenOne);
                const nextIndex = (index + 1) % (members.length);
                nextChosenOne = members[nextIndex].id;
            } else { // premier élu
                // full random
                const randomMember = members[Math.floor(Math.random() * members.length)];
                nextChosenOne = randomMember.id
            }

            logger.info(`[POLL] Updating chosen one for group ${group.id} to user ${nextChosenOne}`);

            // mtn on doit faire la MAJ dans la DB
            await group.update(
                {
                    chosenOneUserID: nextChosenOne,
                    status: GroupStatus.SUN_WAITING_THEME
                },
                { transaction }
            );
        }

        await transaction.commit();
    } catch (err) {
        logger.info("sql error : " + err);
        await transaction.rollback();
    }
}