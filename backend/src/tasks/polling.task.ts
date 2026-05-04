import { Op } from "sequelize";
import { logger } from "../middleware/logger.js";
import Group from "../models/elem/Group.model.js";
import GroupUser from "../models/link/GroupUser.model.js";
import GroupPeriod from "../models/logic/GroupPeriod.model.js";
import PredRank from "../models/logic/PredRank.model.js";
import RealRank from "../models/logic/RealRank.model.js";
import db from "../shared/db.js";
import { GroupStatus } from "../shared/GroupStatus.js";
import { PeriodType } from "../shared/PeriodType.js";
import { getIO } from "../shared/socket.js";
import { TimeManager } from "../shared/TimeManager.js";
import { updatePeriods } from "./polling/periods.task.js";
import { updateServicePlaylists } from "./polling/playlists.task.js";
import { updateScores } from "./polling/scores.task.js";

// Cache des états à mettre à jour
type PollingSetInfo = {
    groupId: number,
    newStatus: GroupStatus | null
}

// Association période d'un groupe -> état à assigner au groupe
export const nextStatusByPeriod: Record<PeriodType, GroupStatus> = {
    [PeriodType.WK_PERIOD]: GroupStatus.WK_WAITING_SUB,
    [PeriodType.NEW_CYCLE]: GroupStatus.SUN_WAITING_THEME,
    [PeriodType.QUIZ_TIME]: GroupStatus.SAT_WAITING_QUIZ
};

// Pour ne pas avoir de race conditions
let polling = false;

/**
 * Tâche de polling,
 * exécutée chaque minute (ou à chaque avancée du temps fictif).
 * Exécute les tâches qui correspondent à chaque période
 * (simple changement d'état ou passage à un cycle suivant le cas échéant.)
 */
export async function generalPollingTask() {
    logger.info("[POLL] Running general polling task.");

    // Si la tâche est déjà en train de s'éxécuter, on ne la rééxécute pas.
    if (polling) {
        logger.error("[POLL] Already polling");
        return;
    }

    polling = true;

    try {
        const now = TimeManager.now();
        // Péiodes à traiter
        const nextSubPeriods = await GroupPeriod.findAll({
            where: {
                periodStart: { [Op.lte]: now }, // Seulement les période (jobs) assignés dans le passé
                processedAt: null // Si la période (le job) est déjà process, on ignore
            },
            include: [{
                model: Group
            }]
        });

        const groupsToSet: PollingSetInfo[] = [];

        for (const p of nextSubPeriods) {
            let transaction;
            try {
                if (!p.Group) continue;
                transaction = await db.transaction();

                // Passage à un nouveau cycle
                if (p.periodType === PeriodType.NEW_CYCLE) {
                    logger.info(`POLL] Starting a new cycle for group ${p.Group?.id}`);
                    logger.info(`[POLL] updating youtube playlists for group ${p.Group.id}`);
                    await updateServicePlaylists(p.Group);
                    logger.info('[POLL] [NEWCYCLE] updating scores.');
                    await updateScores(p.Group);
                    await GroupUser.resetDoneBooleans(p.Group.id);
                    logger.info('[POLL] [NEWCYCLE] resetting rankings');
                    await RealRank.destroyRankingFor(p.Group.id);
                    await PredRank.destroyRankingFor(p.Group.id);
                    logger.info('[POLL] [NEWCYCLE] updating chosen one.');
                    await p.Group.updateChosenOne(transaction);
                    logger.info(`[POLL] [NEWCYCLE] updating periods for group ${p.Group.id}`);
                    await updatePeriods(p.Group, transaction);
                    logger.info(`[POLL] [NEWCYCLE] updated periods. new cycle processing finished`);
                } 

                const newStatus = nextStatusByPeriod[p.periodType];
                if (newStatus)
                    groupsToSet.push({groupId: p.Group.id, newStatus});

                await GroupPeriod.update(
                    { processedAt: now },
                    { where: { id: p.id }, transaction }
                );

                await transaction.commit();
            } catch (err) {
                await transaction?.rollback();
                logger.error(`[POLL] Processing failed for period ${p.id}:`, err);
            }
        }

        // On applique la MAJ des états mis en cahe dans groupsToSet
        if (groupsToSet.length > 0) {
            for (const item of groupsToSet) {
                logger.info(`[POLL] Updating group ${item.groupId} to status ${item.newStatus}`);

                const group = await Group.findByPk(item.groupId);
                if (!group) continue;

                await group.update(
                    { status: item.newStatus }
                );

                // Pour tous les users qui sont abonnés au groupe group:{id},
                // donc qui sont sur la page de l'app group/{id},
                // on envoie que le groupe a été MAJ
                getIO().to(`group:${group.id}`).emit(`group:${group.id}:refresh`);

                // Pour chaque utilisateur appartenant au groupe,
                // on envoie également qu'un de ses groupes a été MAJ
                const users = await group.getUsers({attributes: ['id']});
                for (const user of users) {
                    getIO().to(`user:${user.id}`).emit(`groups:refresh`);
                }
            }
        }

        logger.info("[POLL] polling task end");
    } finally { 
        polling = false;
    }
}
