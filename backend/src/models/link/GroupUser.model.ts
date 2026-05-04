import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import db from '../../shared/db.js';
import { Group } from '../elem/Group.model.js';
import { User } from '../elem/User.model.js';
import { Certificate } from 'node:crypto';

export class GroupUser extends Model <
    InferAttributes<GroupUser>,
    InferCreationAttributes<GroupUser>
> {
    declare groupID: number;
    declare userID: number;
    declare notifPending: CreationOptional<boolean | null>;
    declare tempChosenQuizScore: CreationOptional<number | null>;
    declare weeklyScore: CreationOptional<number | null>;
    declare globalScore: CreationOptional<number | null>;
    declare servicePlaylistID: CreationOptional<string | null>;
    declare quizDone: CreationOptional<boolean | null>;
    declare rankDone: CreationOptional<boolean | null>;

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
        references: { model: Group, key: 'id' }
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