import {
    DataTypes, Model,
    InferAttributes, InferCreationAttributes,
    BelongsToGetAssociationMixin,
} from 'sequelize';
import db from '../../shared/db.js';
import { Group } from '../elem/Group.model.js';
import { User } from '../elem/User.model.js';
import { Track } from '../elem/Track.model.js';

/**
 * Représente le classement des préférences de l'élu.e.
 */
export class RealRank extends Model <
    InferAttributes<RealRank>,
    InferCreationAttributes<RealRank>
> {
    // Ces trois identifient une entrée dans GroupPlaylist
    declare groupID: number;
    declare trackID: number;
    declare userID: number;
    // ID de celui qui fait le classement,
    // qui sera donc toujours l'élu.e
    declare oracleUserID: number;
    declare rank: number;

    declare getGroup: BelongsToGetAssociationMixin<Group>;
    declare getTrack: BelongsToGetAssociationMixin<Track>;
    declare getSubject: BelongsToGetAssociationMixin<User>;
    declare getPredictor: BelongsToGetAssociationMixin<User>;

    /**
     * Supprime les classements pour un groupe
     * @param groupId 
     */
    static async destroyRankingFor(groupId: number) {
        await this.destroy({
            where: {
                groupID: groupId
            }
        });
    }
}

RealRank.init({
    groupID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Groups', key: 'id' }
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