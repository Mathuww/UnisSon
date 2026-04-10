import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes, CreationOptional,
    BelongsToGetAssociationMixin,
} from 'sequelize';
import db from '../dbpool.js';
import { Group } from './groupModel.js';
import { Track } from './trackModel.js';
import { User } from './userModel.js';

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

Group.belongsToMany(Track, { through: GroupPlaylist, foreignKey: 'groupID', otherKey: 'trackID' });
Track.belongsToMany(Group, { through: GroupPlaylist, foreignKey: 'trackID', otherKey: 'groupID' });

User.hasMany(GroupPlaylist, { foreignKey: 'userID', as: 'addedTracks' });
GroupPlaylist.belongsTo(User, { foreignKey: 'userID', as: 'addedBy' });

Group.hasMany(GroupPlaylist, { foreignKey: 'groupID' });
GroupPlaylist.belongsTo(Group, { foreignKey: 'groupID' });

Track.hasMany(GroupPlaylist, { foreignKey: 'trackID' });
GroupPlaylist.belongsTo(Track, { foreignKey: 'trackID' });

export default GroupPlaylist;