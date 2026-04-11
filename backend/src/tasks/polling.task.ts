import { Op } from "sequelize";
import { logger } from "../middleware/logger.js";
import GroupPeriod from "../models/logic/GroupPeriod.model.js";
import Group from "../models/elem/Group.model.js";
import type { GroupStatus } from "../types.d.ts";
import db from "../dbpool.js";

export async function generalPollingTask() {
    logger.info("[POLL] Running general polling task.");

    const transaction = await db.transaction();

    try {
        const now = new Date();
        const nextSubPeriods = await GroupPeriod.findAll({
            where: {
                periodStart: { [Op.lte]: now }
            },
            include: [{
                model: Group
            }],
            transaction: transaction
        });

        const groupsToSet = new Set<number>();

        for (const p of nextSubPeriods) {
            if (!p.Group) continue;

            const valid = [GroupStatus.WK_DONE_SUB, GroupStatus.SUN_DONE_THEME];
            if (!p.Group.status || !valid.includes(p.Group.status)) {
                logger.warn(`In group ${p.Group.id}, for next period starting on ${p.periodStart.getDate()} : cant reset to WK_WAITING_SUB since the group is not a valid status (${p.Group.status})`);
                continue;
            }

            groupsToSet.add(p.Group.id);
        }

        await Group.update(
            {status: GroupStatus.WK_WAITING_SUB},
            {
                where: {id: { [Op.in]: [...groupsToSet] }},
                transaction: transaction
            }
        );

        await transaction.commit();
    } catch (err) {
        logger.error("error in general poll task : ", err);
        await transaction.rollback();
    }
}