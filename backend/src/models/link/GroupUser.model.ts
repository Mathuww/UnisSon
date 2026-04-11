import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes, CreationOptional,
} from 'sequelize';
import db from '../../dbpool.js';
import { Group } from '../elem/Group.model.js';
import { User } from '../elem/User.model.js';

export class GroupUser extends Model <
    InferAttributes<GroupUser>,
    InferCreationAttributes<GroupUser>
> {
    declare groupID: number;
    declare userID: number;
    declare notifPending: boolean | null;
    declare weeklyScore: CreationOptional<number | null>;
    declare globalScore: CreationOptional<number | null>;
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
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'GroupsUsers',
});

export default GroupUser;