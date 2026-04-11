import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes,
    BelongsToGetAssociationMixin,
} from 'sequelize';
import db from '../../dbpool.js';
import { Group } from '../elem/Group.model.js';
import { User } from '../elem/User.model.js';
import { Track } from '../elem/Track.model.js';

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

export default RealRank;