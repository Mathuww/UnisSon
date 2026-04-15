import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes, CreationOptional,
    BelongsToGetAssociationMixin,
} from 'sequelize';
import db from '../../shared/db.js';
import { Track } from '../elem/Track.model.js';
import { User } from '../elem/User.model.js';
import Group from '../elem/Group.model.js';

export class GroupPlaylist extends Model <
    InferAttributes<GroupPlaylist>,
    InferCreationAttributes<GroupPlaylist>
> {
    declare groupID: number;
    declare trackID: number;
    declare userID: number;
    declare addedAt: CreationOptional<Date | null>;

    declare getGroup: BelongsToGetAssociationMixin<Group>;
    declare getTrack: BelongsToGetAssociationMixin<Track>;
    declare getAddedBy: BelongsToGetAssociationMixin<User>;
}

GroupPlaylist.init({
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
        references: { model: User, key: 'id' }
    },
    addedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'GroupsPlaylists',
});


export default GroupPlaylist;