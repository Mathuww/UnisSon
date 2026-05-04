import { Transaction } from "sequelize";
import Group from "../../models/elem/Group.model.js";
import GroupPeriod from "../../models/logic/GroupPeriod.model.js";
import { TimeManager } from "../../shared/TimeManager.js";
import { PeriodType } from "../../shared/PeriodType.js";


const DEFAULT_PERIOD_NB = 2;
const MIN_NOTIF_HOUR = 9; // 9h00
const MAX_NOTIF_HOUR = 20; // => 20h59

/**
 * Crée dans la DB les périodes pour le nouveau cycle,
 * qui détermineront quand mettre à jour les opérations possibles pour ce groupe (ajouter une musique, ...)
 * et quand exécuter la logique de passage au prochain cycle (le prochain dimanche)
 * @param group le groupe à traiter
 * @param transaction la transaction SQL, nécessaire pour aussi longue opération
 */
export async function updatePeriods(group: Group, transaction: Transaction) {
    // On détruit toutes les périodes pour ce groupe,
    // pour ne pas polluer la DB
    // (On peut se le permettre grâce à la transaction : si on ne va pas au bout, on rollback)
    await GroupPeriod.destroy({
        where: {
            groupID: group.id,
            processedAt: null
        },
        transaction: transaction
    });

    // Nombres de musiques possibles à ajouter en une semaine
    const periodNb = group.notifNB ?? DEFAULT_PERIOD_NB;
    
    // Date de début du nouveau cycle (lendemain à 00h00)
    const cycleStart: Date = TimeManager.now();
    cycleStart.setDate(cycleStart.getDate() + 1);
    cycleStart.setHours(0, 0, 0, 0);

    await group.update({
        lastCycleChange: cycleStart,
    }, {transaction});

    // Périodes d'"ajout de musique" :
    // periodNb fois par semaine
    const periods = [];
    for (let i = 0; i < periodNb; i++) {
        const daysToAdd = i * Math.floor(7 / periodNb);
        const periodStart: Date = new Date(cycleStart);
        periodStart.setDate(cycleStart.getDate() + daysToAdd);

        // Heure random entre 9h et 20h59
        periodStart.setHours(
            MIN_NOTIF_HOUR + Math.floor(Math.random() * (MAX_NOTIF_HOUR - MIN_NOTIF_HOUR)),
            Math.floor(Math.random() * 59)
        );

        periods.push({
            groupID: group.id,
            periodStart: periodStart,
            processedAt: null,
            periodType: PeriodType.WK_PERIOD
        });
    }

    // Passage au mode quiz le samedi suivant
    periods.push({
            groupID: group.id,
            periodStart: TimeManager.getNextDay(6), // Prochain samedi
            processedAt: null,
            periodType: PeriodType.QUIZ_TIME
        });

    // Passage au prochain cycle
    periods.push({
            groupID: group.id,
            periodStart: TimeManager.getNextDay(0), // Prochain dimanche
            processedAt: null,
            periodType: PeriodType.NEW_CYCLE
        });

    await GroupPeriod.bulkCreate(periods, { transaction });
}