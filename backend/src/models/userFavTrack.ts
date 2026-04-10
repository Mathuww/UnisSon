import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes,
} from 'sequelize';
import db from '../dbpool.js';
import { Track } from './trackModel.js';
import { User } from './userModel.js';

export class FavTrack extends Model <
    InferAttributes<FavTrack>,
    InferCreationAttributes<FavTrack>
> {
    declare trackID: number;
    declare userID: number;
    declare comment: string | null;
    declare rank: number;
}

FavTrack.init({
    trackID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: Track, key: 'id' }
    },
    userID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: User, key: 'id' }
    },
    comment: {
        type: DataTypes.STRING(1024),
        allowNull: true,
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'UsersFavoriteTracks',
});

User.belongsToMany(Track, { through: FavTrack, foreignKey: 'userID', otherKey: 'trackID', as: 'favoriteTracks' });
Track.belongsToMany(User, { through: FavTrack, foreignKey: 'trackID', otherKey: 'userID', as: 'favoritedBy' });

export default FavTrack;