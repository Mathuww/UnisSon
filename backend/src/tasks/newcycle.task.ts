import { Transaction } from "sequelize";
import db from "../shared/db.js";
import { logger } from "../middleware/logger.js";
import Group from "../models/elem/Group.model.js";
import { GroupStatus } from "../shared/GroupStatus.js";
import GroupPeriod from "../models/logic/GroupPeriod.model.js";

const DEFAULT_PERIOD_NB = 2;
const MIN_NOTIF_HOUR = 9; // 9h00
const MAX_NOTIF_HOUR = 20; // => 20h59

async function updateChosenOne(group: Group, transaction: Transaction) {
    const members = await group.getUsers({ transaction: transaction });
    if (!members.length) return;

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

async function updatePeriods(group: Group, transaction: Transaction) {
    const periodNb = group.notifNB ?? DEFAULT_PERIOD_NB;
    
    const cycleStart: Date = new Date();
    cycleStart.setDate(cycleStart.getDate() + 1);
    cycleStart.setHours(0, 0, 0, 0);

    for (let i = 0; i < periodNb; i++) {
        const daysToAdd = i * Math.floor(7 / periodNb);
        const periodStart: Date = new Date(cycleStart);
        periodStart.setDate(cycleStart.getDate() + daysToAdd);

        // Heure random entre 9h et 20h59
        periodStart.setHours(
            MIN_NOTIF_HOUR + Math.floor(Math.random() * (MAX_NOTIF_HOUR - MIN_NOTIF_HOUR)),
            Math.floor(Math.random() * 59)
        );

        await GroupPeriod.create({
            groupID: group.id,
            periodStart: periodStart
        }, {transaction: transaction});
    }
}

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
        const groups = await Group.findAll({ transaction: transaction });

        // Pour chaque groupe
        for (const group of groups) {
            await updateChosenOne(group, transaction);
            await updatePeriods(group, transaction);
        }

        await transaction.commit();
    } catch (err) {
        logger.info("sql error : " + err);
        await transaction.rollback();
    }
}