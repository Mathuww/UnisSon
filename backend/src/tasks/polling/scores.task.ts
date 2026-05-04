import { Sequelize } from "sequelize";
import Group from "../../models/elem/Group.model.js";
import User from "../../models/elem/User.model.js";
import GroupUser from "../../models/link/GroupUser.model.js";
import PredRank from "../../models/logic/PredRank.model.js";
import RealRank from "../../models/logic/RealRank.model.js";

/**
 * Met à jour les scores des users de tout un groupe
 * @param group le groupe
 */
export async function updateScores(group: Group) {
    let toUpdate: {userId: number, weeklyScore: number}[] = []; // userId -> score

    const users = await group.getUsers({
        joinTableAttributes: ['tempChosenQuizScore']
    }) as (User & { GroupUser: GroupUser })[];;

    const realRanks = await RealRank.findAll({
        where: {
            groupID: group.id
        }
    });
    const tracksRanked = realRanks.length;

    // pour pouvoir faire .get(user.id)
    const realRanksByUserId = new Map(
        realRanks.map(r => [r.userID, r])
    );

    const predRanks = await PredRank.findAll({
        where: {
            groupID: group.id
        }
    });

    for (const user of users) {
        let thisWeekScore = user.GroupUser.tempChosenQuizScore ?? 0;
        console.log(`for ${user.nickname}: reusing temp quiz score of ${thisWeekScore}`);
        const rank = realRanksByUserId.get(user.id);
        if (rank && group.chosenOneUserID != user.id) { // Pas élu
            // Le dernier prend 20, le premier prend 20 * (tracks classées - 1)
            thisWeekScore += 20 * (tracksRanked - rank.rank);
        }

        // prédictions effectuée par l'utilisateur
        const userPredRanks = predRanks.filter(p => p.oracleUserID === user.id);
        userPredRanks.forEach((userPredRank: PredRank) => {
            const realRankForTrack = predRanks.find(p => p.trackID === userPredRank.trackID);
            if (userPredRank.rank === realRankForTrack?.rank) {
                // 20 points par prédiction correcte !
                thisWeekScore += 20;
            }
        });

        toUpdate.push({userId: user.id, weeklyScore: thisWeekScore});
    }

    // écriture parallèle
    await Promise.all(
        toUpdate.map(item =>
            GroupUser.update({
                weeklyScore: item.weeklyScore,
                // on ajoute weeklyScore au score total de l'user
                globalScore: Sequelize.literal(`globalScore + ${item.weeklyScore}`)
            }, { 
                where: {
                        userID: item.userId,
                        groupID: group.id
                } 
            })
        )
    );
}
