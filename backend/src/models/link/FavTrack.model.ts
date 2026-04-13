import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes,
} from 'sequelize';
import db from '../../shared/db.js';
import { Track } from '../elem/Track.model.js';
import { User } from '../elem/User.model.js';

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


export default FavTrack;