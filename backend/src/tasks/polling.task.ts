import { Op, Transaction } from "sequelize";
import { logger } from "../middleware/logger.js";
import Group from "../models/elem/Group.model.js";
import GroupPeriod from "../models/logic/GroupPeriod.model.js";
import db from "../shared/db.js";
import { GroupStatus } from "../shared/GroupStatus.js";
import { PeriodType } from "../shared/PeriodType.js";
import { TimeManager } from "../shared/TimeManager.js";
import { transcode } from "node:buffer";
import GroupUser from "../models/link/GroupUser.model.js";
import { AuthService } from "../service/auth.service.js";
import { YoutubeService } from "../service/youtube.service.js";
import User from "../models/elem/User.model.js";
import { group } from "node:console";
import { getIO } from "../shared/socket.js";

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
        lastCycleChange: cycleStart,
    }, {transaction});

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

    periods.push({
            groupID: group.id,
            periodStart: TimeManager.getNextDay(6), // SAMEDI
            processedAt: null,
            periodType: PeriodType.QUIZ_TIME
        });

    periods.push({
            groupID: group.id,
            periodStart: TimeManager.getNextDay(0), // dimanche
            processedAt: null,
            periodType: PeriodType.NEW_CYCLE
        });

    await GroupPeriod.bulkCreate(periods, { transaction });
}

async function updateServicePlaylists(group: Group) {
    const entriesSinceLastCycle = await group.getEntriesSinceLastCycle();

    const users = await group.getUsers({
        joinTableAttributes: ['servicePlaylistID']
    }) as (User & { GroupUser: GroupUser })[];;

    for (const user of users) {
        if (user?.GroupUser.servicePlaylistID) {
            const client = await AuthService.getOAuthClient(user);
            if (client) {
                for (const entry of entriesSinceLastCycle) {
                    const ytResponse = await YoutubeService.addVideoTemp(user.GroupUser.servicePlaylistID, entry.track.youtubeLink || "", client);
                    if (ytResponse && ytResponse.data) {
                        logger.info(`Added video ${entry.track.youtubeLink}`);
                    }
                }
            }
        }
    }
}

export async function generalPollingTask() {
    logger.info("[POLL] Running general polling task.");

    if (polling) {
        logger.error("[POLL] Already running");
        return;
    }

    polling = true;

    try {
        const now = TimeManager.now();
        const nextSubPeriods = await GroupPeriod.findAll({
            where: {
                periodStart: { [Op.lte]: now },
                processedAt: null
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

                if (p.periodType === PeriodType.NEW_CYCLE) {
                    logger.info(`Starting a new cycle for group ${p.Group?.id}`);
                    logger.info(`updating youtube playlists for group ${p.Group.id}`);
                    await updateServicePlaylists(p.Group);
                    logger.info('updated playlists. updating chosen one.');
                    await p.Group.updateChosenOne(transaction);
                    logger.info(`updated chosen one. updating periods for group ${p.Group.id}`);
                    await updatePeriods(p.Group, transaction);
                    logger.info(`updated periods. new cycle processing finished`);
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

        if (groupsToSet.length > 0) {
            for (const item of groupsToSet) {
                logger.info(`Updating group ${item.groupId} to status ${item.newStatus}`);

                const group = await Group.findByPk(item.groupId);
                if (!group) continue;

                await group.update(
                    { status: item.newStatus }
                );

                // pour chaque utilisateur appartenant au groupe
                const users = await group.getUsers({attributes: ['id']});
                getIO().to(`group:${group.id}`).emit(`group:${group.id}:refresh`);
                //getIO().emit(`group:${group.id}:refresh`);
                for (const user of users) {
                    getIO().to(`user:${user.id}`).emit(`groups:refresh`);
                    //getIO().emit(`groups:refresh`);
                }
            }
        }

        logger.info("polling task end");
    } finally { 
        polling = false;
    }
}