import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes, CreationOptional,
    HasManyGetAssociationsMixin, BelongsToManyGetAssociationsMixin,
} from 'sequelize';
import db from '../dbpool.js';
import Group from './groupModel.js';
import User from './userModel.js';
import PredRank from './predRankingModel.js';
import RealRank from './realRankingModel.js';
import GroupPlaylist from './groupPlaylistsModel.js';

export class Track extends Model <
    InferAttributes<Track, { omit: 'createdAt' | 'updatedAt' }>,
    InferCreationAttributes<Track, { omit: 'createdAt' | 'updatedAt' }>
> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare artist: string | null;
    declare ISRC: string | null;
    declare youtubeLink: string | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare getGroups: BelongsToManyGetAssociationsMixin<Group>;
    declare getFavoritedBy: BelongsToManyGetAssociationsMixin<User>;
    declare getPredRanks: HasManyGetAssociationsMixin<PredRank>;
    declare getRealRanks: HasManyGetAssociationsMixin<RealRank>;
    declare getGroupPlaylists: HasManyGetAssociationsMixin<GroupPlaylist>;
}

Track.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    artist: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    ISRC: {
        type: DataTypes.STRING(16),
        allowNull: true,
    },
    youtubeLink: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
}, {
    sequelize: db,
    timestamps: true,
    tableName: 'Tracks',
});

export default Track;