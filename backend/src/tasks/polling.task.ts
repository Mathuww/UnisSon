import { Op, Transaction } from "sequelize";
import { logger } from "../middleware/logger.js";
import Group from "../models/elem/Group.model.js";
import GroupPeriod from "../models/logic/GroupPeriod.model.js";
import db from "../shared/db.js";
import { GroupStatus } from "../shared/GroupStatus.js";
import { PeriodType } from "../shared/PeriodType.js";
import { TimeManager } from "../shared/TimeManager.js";

const DEFAULT_PERIOD_NB = 2;
const MIN_NOTIF_HOUR = 9; // 9h00
const MAX_NOTIF_HOUR = 20; // => 20h59

type PollingSetInfo = {
    groupId: number,
    newStatus: GroupStatus | null
}

export const nextStatusByPeriod: Record<PeriodType, GroupStatus> = {
    [PeriodType.WK_PERIOD]: GroupStatus.WK_WAITING_SUB,
    [PeriodType.NEW_CYCLE]: GroupStatus.SUN_WAITING_THEME,
    [PeriodType.QUIZ_TIME]: GroupStatus.SAT_WAITING_QUIZ
};

let polling = false;

async function updatePeriods(group: Group, transaction: Transaction) {
    await GroupPeriod.destroy({
        where: {
            groupID: group.id,
            processedAt: null
        },
        transaction: transaction
    });

    const periodNb = group.notifNB ?? DEFAULT_PERIOD_NB;
    
    const cycleStart: Date = TimeManager.now();
    cycleStart.setDate(cycleStart.getDate() + 1);
    cycleStart.setHours(0, 0, 0, 0);

    await group.update({
        lastCycleChange: cycleStart
    });

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
            periodStart: periodStart,
            processedAt: null,
            periodType: PeriodType.WK_PERIOD
        }, {transaction: transaction});
    }

    await GroupPeriod.create({
            groupID: group.id,
            periodStart: TimeManager.getNextDay(6), // SAMEDI
            processedAt: null,
            periodType: PeriodType.QUIZ_TIME
        }, {transaction: transaction});

    await GroupPeriod.create({
            groupID: group.id,
            periodStart: TimeManager.getNextDay(7),
            processedAt: null,
            periodType: PeriodType.NEW_CYCLE
        }, {transaction: transaction});
}

export async function generalPollingTask() {
    logger.info("[POLL] Running general polling task.");

    if (polling) {
        logger.error("[POLL] Already running");
        return;
    }

    polling = true;

    const transaction = undefined; await db.transaction();

    try {
        const now = TimeManager.now();
        const nextSubPeriods = await GroupPeriod.findAll({
            where: {
                periodStart: { [Op.lte]: now },
                processedAt: null
            },
            include: [{
                model: Group
            }],
            transaction: transaction
        });

        const groupsToSet: PollingSetInfo[] = [];

        for (const p of nextSubPeriods) {
            if (!p.Group) continue;

            if (p.periodType === PeriodType.NEW_CYCLE) {
                logger.info(`Starting a new cycle for group ${p.Group?.id}`);
                await p.Group.updateChosenOne(transaction);
                await updatePeriods(p.Group, transaction);
            } else {
                const newStatus = nextStatusByPeriod[p.periodType];
                if (newStatus)
                    groupsToSet.push({groupId: p.Group.id, newStatus});
            }

            await GroupPeriod.update(
                { processedAt: now },
                { where: { id: p.id }, transaction }
            );
        }

        if (groupsToSet.length > 0) {
            for (const item of groupsToSet) {
                logger.info(`Updating group ${item.groupId} to status ${item.newStatus}`);

                const group = await Group.findByPk(item.groupId, { transaction });
                if (!group) continue;

                await group.update(
                    { status: item.newStatus },
                    { transaction }
                );
            }
        }

        //await transaction.commit();
        logger.info("polling task end");
    } catch (err) {
        logger.error("error in general poll task : ", err);
        //await transaction.rollback();
    } finally { 
        polling = false;
    }
}