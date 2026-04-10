import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes,
    BelongsToGetAssociationMixin,
} from 'sequelize';
import db from '../dbpool.js';
import { Group } from './groupModel.js';
import { User } from './userModel.js';
import { Track } from './trackModel.js';

export class PredRank extends Model <
    InferAttributes<PredRank>,
    InferCreationAttributes<PredRank>
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

PredRank.init({
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
    tableName: 'PredictingRanking',
});

Group.hasMany(PredRank, { foreignKey: 'groupID' });
PredRank.belongsTo(Group, { foreignKey: 'groupID' });

Track.hasMany(PredRank, { foreignKey: 'trackID' });
PredRank.belongsTo(Track, { foreignKey: 'trackID' });

User.hasMany(PredRank, { foreignKey: 'userID', as: 'receivedPredictions' });
PredRank.belongsTo(User, { foreignKey: 'userID', as: 'subject' });

User.hasMany(PredRank, { foreignKey: 'oracleUserID', as: 'madePredictions' });
PredRank.belongsTo(User, { foreignKey: 'oracleUserID', as: 'predictor' });

export default PredRank;