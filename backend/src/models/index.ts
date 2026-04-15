import './elem/Group.model.js';
import './elem/User.model.js';
import './elem/Track.model.js';

import './link/GroupPlaylist.model.js';
import './link/FavTrack.model.js';
import './link/GroupUser.model.js';

import './logic/GroupPeriod.model.js';
import './logic/Notif.model.js';
import './logic/RealRank.model.js';
import './logic/PredRank.model.js';
import Group from './elem/Group.model.js';
import User from './elem/User.model.js';
import Track from './elem/Track.model.js';
import FavTrack from './link/FavTrack.model.js';
import GroupPlaylist from './link/GroupPlaylist.model.js';
import GroupUser from './link/GroupUser.model.js';
import GroupPeriod from './logic/GroupPeriod.model.js';
import Notif from './logic/Notif.model.js';
import PredRank from './logic/PredRank.model.js';
import RealRank from './logic/RealRank.model.js';
import Invite from './logic/Invite.model.js';

// Group
Group.belongsTo(User, {
    foreignKey: 'chosenOneUserID',
    as: 'chosenUser'
});
User.hasMany(Group, {
    foreignKey: 'chosenOneUserID',
    as: 'chosenInGroups'
});

// FavTrack
User.belongsToMany(Track, { through: FavTrack, foreignKey: 'userID', otherKey: 'trackID', as: 'favoriteTracks' });
Track.belongsToMany(User, { through: FavTrack, foreignKey: 'trackID', otherKey: 'userID', as: 'favoritedBy' });

// GroupPlaylist
Group.belongsToMany(Track, { through: GroupPlaylist, foreignKey: 'groupID', otherKey: 'trackID' });
Track.belongsToMany(Group, { through: GroupPlaylist, foreignKey: 'trackID', otherKey: 'groupID' });

User.hasMany(GroupPlaylist, { foreignKey: 'userID', as: 'addedTracks' });
GroupPlaylist.belongsTo(User, { foreignKey: 'userID', as: 'addedBy' });

Group.hasMany(GroupPlaylist, { foreignKey: 'groupID' });
GroupPlaylist.belongsTo(Group, { foreignKey: 'groupID' });

Track.hasMany(GroupPlaylist, { foreignKey: 'trackID' });
GroupPlaylist.belongsTo(Track, { foreignKey: 'trackID' });

// GroupUser
Group.belongsToMany(User, { through: GroupUser, foreignKey: 'groupID', otherKey: 'userID' });
User.belongsToMany(Group, { through: GroupUser, foreignKey: 'userID', otherKey: 'groupID' });

// GroupPeriod
Group.hasMany(GroupPeriod, { foreignKey: 'groupID', as: 'period' });
GroupPeriod.belongsTo(Group, { foreignKey: 'groupID' });

// Notif
Group.hasMany(Notif, { foreignKey: 'groupID', as: 'notifs' });
Notif.belongsTo(Group, { foreignKey: 'groupID' });

User.hasMany(Notif, { foreignKey: 'userID', as: 'notifs' });
Notif.belongsTo(User, { foreignKey: 'userID' });

// PredRank
Group.hasMany(PredRank, { foreignKey: 'groupID' });
PredRank.belongsTo(Group, { foreignKey: 'groupID' });

Track.hasMany(PredRank, { foreignKey: 'trackID' });
PredRank.belongsTo(Track, { foreignKey: 'trackID' });

User.hasMany(PredRank, { foreignKey: 'userID', as: 'receivedPredictions' });
PredRank.belongsTo(User, { foreignKey: 'userID', as: 'subject' });

User.hasMany(PredRank, { foreignKey: 'oracleUserID', as: 'madePredictions' });
PredRank.belongsTo(User, { foreignKey: 'oracleUserID', as: 'predictor' });

// RealRank
Group.hasMany(RealRank, { foreignKey: 'groupID' });
RealRank.belongsTo(Group, { foreignKey: 'groupID' });

Track.hasMany(RealRank, { foreignKey: 'trackID' });
RealRank.belongsTo(Track, { foreignKey: 'trackID' });

User.hasMany(RealRank, { foreignKey: 'userID', as: 'receivedRealRanks' });
RealRank.belongsTo(User, { foreignKey: 'userID', as: 'realSubject' });

User.hasMany(RealRank, { foreignKey: 'oracleUserID', as: 'madeRealRanks' });
RealRank.belongsTo(User, { foreignKey: 'oracleUserID', as: 'realPredictor' });

// Invite
Group.hasMany(Invite, { foreignKey: 'groupID', as: 'invites' });
Invite.belongsTo(Group, { foreignKey: 'groupID' });

User.hasMany(Invite, { foreignKey: 'inviterUserID', as: 'sentInvites' });
Invite.belongsTo(User, { foreignKey: 'inviterUserID', as: 'inviterUser' });


