import {
    BelongsToManyGetAssociationsMixin,
    CreationOptional,
    DataTypes,
    HasManyGetAssociationsMixin,
    InferAttributes, InferCreationAttributes,
    Model,
} from 'sequelize';
import db from '../dbpool.js';
import Group from './groupModel.js';
import PredRank from './predRankingModel.js';
import Track from './trackModel.js';

export class User extends Model<
    InferAttributes<User, { omit: 'createdAt' | 'updatedAt' }>,
    InferCreationAttributes<User, { omit: 'createdAt' | 'updatedAt' }>
> {
    declare id: CreationOptional<number>;
    declare nickname: string;
    declare email: string;
    declare profileDescription: string | null;
    declare profilePicture: Buffer | null;
    declare provider: 'spotify' | 'google' | null;
    declare premiumAccount: boolean | null;
    declare providerLoginID: string | null;
    declare accessToken: string | null;
    declare refreshToken: string | null;
    declare tokenExpireAt: Date | null;
    declare pushToken: string | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    // Associations 
    declare getGroups: BelongsToManyGetAssociationsMixin<Group>;
    declare getFavoriteTracks: BelongsToManyGetAssociationsMixin<Track>;
    declare getReceivedPredictions: HasManyGetAssociationsMixin<PredRank>;
    declare getMadePredictions: HasManyGetAssociationsMixin<PredRank>;
    declare getChosenInGroups: HasManyGetAssociationsMixin<Group>;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    nickname: { 
        type: DataTypes.STRING(16),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
    },
    profileDescription: {
        type: DataTypes.STRING(1024),
        allowNull: true,
    },
    profilePicture: {
        type: DataTypes.BLOB('medium'),
        allowNull: true,
    },
    provider: {
        type: DataTypes.ENUM('spotify', 'google'),
        allowNull: true,
    },
    premiumAccount: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    providerLoginID: {
        type: DataTypes.STRING(256),
        allowNull: true,
    },
    accessToken: {
        type: DataTypes.STRING(1024),
        allowNull: true,
        unique: true,
    },
    refreshToken: {
        type: DataTypes.STRING(1024),
        allowNull: true,
        unique: true,
    },
    tokenExpireAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    pushToken: {
        type: DataTypes.STRING(4096),
        allowNull: true,
        unique: true,
    },
}, {
    sequelize: db,
    timestamps: true,
    tableName: 'Users',
});

export default User;