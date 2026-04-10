import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes,
    BelongsToGetAssociationMixin,
} from 'sequelize';
import db from '../dbpool.js';
import { Group } from './groupModel.js';
import { User } from './userModel.js';
import { Track } from './trackModel.js';

export class RealRank extends Model <
    InferAttributes<RealRank>,
    InferCreationAttributes<RealRank>
> {
    declare groupID: number;
    declare trackID: number;
    declare userID: number;
    declare oracleUserID: number;
    declare rank: number;

    declare getGroup: BelongsToGetAssociationMixin<Group>;
    declare getTrack: BelongsToGetAssociationMixin<Track>;
    declare getSubject: BelongsToGetAssociationMixin<User>;
    declare getPredictor: BelongsToGetAssociationMixin<User>;
}

RealRank.init({
    groupID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: Group, key: 'id' }
    },
    trackID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: Track, key: 'id' }
    },
    userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: User, key: 'id' },
    },
    oracleUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' },
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'RealRanking',
});

Group.hasMany(RealRank, { foreignKey: 'groupID' });
RealRank.belongsTo(Group, { foreignKey: 'groupID' });

Track.hasMany(RealRank, { foreignKey: 'trackID' });
RealRank.belongsTo(Track, { foreignKey: 'trackID' });

User.hasMany(RealRank, { foreignKey: 'userID', as: 'receivedRealRanks' });
RealRank.belongsTo(User, { foreignKey: 'userID', as: 'realSubject' });

User.hasMany(RealRank, { foreignKey: 'oracleUserID', as: 'madeRealRanks' });
RealRank.belongsTo(User, { foreignKey: 'oracleUserID', as: 'realPredictor' });

export default RealRank;