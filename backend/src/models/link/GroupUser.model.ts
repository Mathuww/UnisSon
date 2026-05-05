import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import db from '../../shared/db.js';
import { Group } from '../elem/Group.model.js';
import { User } from '../elem/User.model.js';

/**
 * Lien utilisateur-groupe,
 * apportant des informations supplémentaires.
 */
export class GroupUser extends Model <
    InferAttributes<GroupUser>,
    InferCreationAttributes<GroupUser>
> {
    declare groupID: number;
    declare userID: number;
    // Censé indiquer si l'user a répondu à la notif ou pas,
    // inutilisé pour l'instant.
    declare notifPending: CreationOptional<boolean | null>;
    // Score obtenu lors du quiz,
    // qui sera ajouté au score hebdomadaire lors de la tâche de 
    // mise à jour des scores
    declare tempChosenQuizScore: CreationOptional<number | null>;
    declare weeklyScore: CreationOptional<number | null>;
    declare globalScore: CreationOptional<number | null>;
    // ID de playlist YouTube
    declare servicePlaylistID: CreationOptional<string | null>;
    // Quiz déjà effectué ?
    declare quizDone: CreationOptional<boolean | null>;
    // Classement déjà effectué ?
    declare rankDone: CreationOptional<boolean | null>;

    /**
     * Remet à zéro les propriétés représentant un état hebdomadaire
     * @param groupId l'id du groupe
     */
    static async resetDoneBooleans(groupId: number) {
        await this.update({
            quizDone: false,
            rankDone: false,
            tempChosenQuizScore: 0
        }, {
            where: {
                groupID: groupId
            }
        });
    }
}

GroupUser.init({
    groupID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Groups', key: 'id' }
    },
    userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: { model: User, key: 'id' },
    },
    notifPending: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    tempChosenQuizScore: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    weeklyScore: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: true,
    },
    globalScore: {
        type: DataTypes.INTEGER.UNSIGNED,
        defaultValue: 0,
        allowNull: true,
    },
    servicePlaylistID: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    quizDone: {
        type: DataTypes.BOOLEAN, 
        allowNull: true
    },
    rankDone: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'GroupsUsers',
});

export default GroupUser;