import { 
    DataTypes, Model, 
    InferAttributes, InferCreationAttributes, CreationOptional,
    BelongsToGetAssociationMixin, HasManyGetAssociationsMixin,
    NonAttribute,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyAddAssociationMixin
} from 'sequelize';
import db from '../dbpool.js';
import User from './userModel.js';
import Track from './trackModel.js';

export class Group extends Model<InferAttributes<Group>, InferCreationAttributes<Group>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare maxUsers: CreationOptional<number | null>;
    declare notifNB: number | null;
    declare groupPicture: Buffer | null;
    declare chosenOneUserID: number | null;
    declare status: number | null;
    declare lastCycleChange: Date | null;
    declare theme: string | null;

    // Associations
    declare getChosenUser: BelongsToGetAssociationMixin<User>;
    declare getUsers: BelongsToManyGetAssociationsMixin<User>;
    declare addUser: BelongsToManyAddAssociationMixin<User, number>;
    declare removeUser: BelongsToManyRemoveAssociationMixin<User, number>;

    declare getTracks: BelongsToManyGetAssociationsMixin<Track>;
    declare addTrack: BelongsToManyAddAssociationMixin<Track, number>;
}

Group.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    maxUsers: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        defaultValue: 4,
    },
    notifNB: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
    },
    groupPicture: {
        type: DataTypes.BLOB('medium'),
        allowNull: true,
    },
    chosenOneUserID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: User, key: 'id' },
    },
    status: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    lastCycleChange: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    theme: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
}, {
    sequelize: db, 
    timestamps: true,
    tableName: 'Groups',
});

Group.belongsTo(User, {
    foreignKey: 'chosenOneUserID',
    as: 'chosenUser'
});
User.hasMany(Group, {
    foreignKey: 'chosenOneUserID',
    as: 'chosenInGroups'
});

export default Group;