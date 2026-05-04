import { 
    DataTypes, Model, 
    InferAttributes, InferCreationAttributes, CreationOptional,
    BelongsToGetAssociationMixin, HasManyGetAssociationsMixin,
    NonAttribute,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyAddAssociationMixin,
    Transaction
} from 'sequelize';
import db from '../../shared/db.js';
import User from './User.model.js';
import Track from './Track.model.js';
import GroupPeriod from '../logic/GroupPeriod.model.js';
import { Op } from 'sequelize';
import GroupPlaylist from '../link/GroupPlaylist.model.js';
import { GroupStatus } from '../../shared/GroupStatus.js';
import { logger } from '../../middleware/logger.js';
import { TimeManager } from '../../shared/TimeManager.js';

/**
 * Représente un groupe en DB.
 * Structure élémentaire 
 * @class
 */
export class Group extends Model<InferAttributes<Group>, InferCreationAttributes<Group>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare maxUsers: CreationOptional<number | null>;
    declare notifNB: number | null; // Nombre de musiques à ajouter / semaine
    declare groupPicture: Buffer | null; // PDP du groupe
    declare chosenOneUserID: number | null;
    declare status: GroupStatus | null;
    declare lastCycleChange: Date | null;
    declare theme: string | null;

    // Associations
    declare getChosenUser: BelongsToGetAssociationMixin<User>;
    declare getUsers: BelongsToManyGetAssociationsMixin<User>;

    /**
     * Vérifie si un utilisateur appartient à un groupe.
     * @param userID 
     * @returns 
     */
    async isUserInGroup(userID: number): Promise<boolean> {
        const user = await this.getUsers({
            where: { id: userID },
            attributes: ['id'], // on élimine le bruit
            joinTableAttributes: [] // même chose
        });

        return user.length > 0;
    }

    declare addUser: BelongsToManyAddAssociationMixin<User, number>;
    declare removeUser: BelongsToManyRemoveAssociationMixin<User, number>;

    declare getTracks: BelongsToManyGetAssociationsMixin<Track>;
    declare addTrack: BelongsToManyAddAssociationMixin<Track, number>;

    declare getPeriods: HasManyGetAssociationsMixin<GroupPeriod>;

    /**
     * Renvoie la période (objet DB GroupPeriod) 
     * dans laquelle ce groupe se situe actuellement
     */
    async getCurrentPeriod(): Promise<GroupPeriod | null> {
        logger.info(`Running getcurrentperiod for group ${this.id}`);
        const periods = await this.getPeriods({
            order: [['periodStart', 'ASC']] // de la plus ancienne à la plus actuelle
        });
        const now = TimeManager.now();

        const current: GroupPeriod | undefined = periods.find((p: GroupPeriod, i: number) => {
            // Date de début de la période suivante
            const next = periods[i + 1]?.periodStart ?? new Date("9999-12-31");
            // On renvoie cette GroupPeriod dès quelle n'est pas passée et que c'est la plus récente
            return p.periodStart <= now && now < next;
        });

        const p = current ?? null;
        logger.info(`currentperiod: returning ${p}`);
        return p;
    }
    
    /**
     * Vérifie si un user peut ajouter un morceau dans ce groupe
     * (s'il n'en pas déjà ajouté pour cette période)
     * @param userID 
     * @returns 
     */
    async canUserAdd(userID: number): Promise<boolean> {
        const currentPeriod = await this.getCurrentPeriod();
        if (!currentPeriod) {
            logger.warn("period not found");
            return false;
        }

        const currentUserTracks = await GroupPlaylist.findOne({
            where: {
                groupID: this.id,
                userID: userID,
                addedAt: {[Op.gte]: currentPeriod.periodStart}
            }
        });

        return !currentUserTracks;
    }

    /**
     * Vérifie si tous les users ont ajouté un morceau pour cette période.
     * @returns 
     */
    async allUsersAdded(): Promise<boolean> {
        const period = await this.getCurrentPeriod(); 
        if (!period) return false;

        const users = await this.getUsers({ attributes: ['id'] });
        
        const addedCount = await GroupPlaylist.count({
            where: {
                groupID: this.id,
                userID: { [Op.in]: users.map(u => u.id) },
                addedAt: { [Op.gte]: period.periodStart }
            },
            distinct: true,
            col: 'userID'
        });

        return addedCount === users.length;
    }

    /**
     * Met à jour l'élu.e par roulement
     * (pour ne jamais avoir deux fois le même élu)
     * @param transaction 
     * @returns 
     */
    async updateChosenOne(transaction?: Transaction) {
        console.log(`updating chosen one for group ${this.id}`);

        const members = await this.getUsers({ transaction, attributes: ['id'] });

        if (!members.length) return;
    
        // Là on a la liste des utilisateurs dans ce groupe.
        // Du coup on veut choisir le suivant de celui qui était chosen one avant
        // (ou un au hasard si le group est tout neuf)
    
        // Qui était le chosen one avant ?
        const prevChosenOne: number | null = this.chosenOneUserID;
    
        let nextChosenOne;
        if (prevChosenOne) {
            // On choisit le suivant par roulement
            const index = members.findIndex(u => u.id === prevChosenOne);
            const nextIndex = (index + 1) % (members.length);
            nextChosenOne = members[nextIndex].id;
        } else { // premier élu
            // full random
            const randomMember = members[Math.floor(Math.random() * members.length)];
            nextChosenOne = randomMember.id
        }
    
        logger.info(`Updating chosen one for group ${this.id} to user ${nextChosenOne}`);
    
        // Maintenant on doit faire la MAJ dans la DB
        await this.update(
            {
                chosenOneUserID: nextChosenOne,
                status: GroupStatus.SUN_WAITING_THEME
            },
            { transaction }
        );
    }

    /**
     * Renvoie la liste des morceaux ajoutés dans ce groupe
     * depuis le dernier changement de cycle
     * @param transaction 
     * @returns 
     */
    async getEntriesSinceLastCycle(transaction?: Transaction) {
        // findAll va renvoyer un objet GroupPlaylist trop bruité,
        // qu'on va refactor par la suite
        const playlistEntries = await GroupPlaylist.findAll({
            where: {
                groupID: this.id,
                addedAt: {
                    // Pas avant le dernier passage à un nouveau cycle
                    [Op.gte]: this.lastCycleChange || TimeManager.now()
                }
            },
            // ajouter les infos des tables jointes
            include: [{model: Track, as: 'Track'}, {model: User, as: 'addedBy'}]
        }) as (GroupPlaylist & {Track: Track, addedBy: User})[];

        // Refactor la liste sous forme de simple objet {track, addedBy},
        // sans bruit,
        // pour être facilement interprétable par le frontend
        return playlistEntries.map((value) => {
            const trackData = value.Track.get({ plain: true });
            const userData = value.addedBy ? value.addedBy.get({ plain: true }) : null;

            return {
                track: trackData,
                addedBy: userData
            };
        });
    }
}

Group.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },
    maxUsers: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
        defaultValue: 4,
    },
    notifNB: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: true,
    },
    groupPicture: {
        type: DataTypes.BLOB('medium'),
        allowNull: true,
    },
    chosenOneUserID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: User, key: 'id' },
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastCycleChange: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    theme: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
}, {
    sequelize: db, 
    timestamps: true,
    tableName: 'Groups',
});


export default Group;