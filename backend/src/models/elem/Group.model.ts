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

export class Group extends Model<InferAttributes<Group>, InferCreationAttributes<Group>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare maxUsers: CreationOptional<number | null>;
    declare notifNB: number | null;
    declare groupPicture: Buffer | null;
    declare chosenOneUserID: number | null;
    declare status: GroupStatus | null;
    declare lastCycleChange: Date | null;
    declare theme: string | null;

    // Associations
    declare getChosenUser: BelongsToGetAssociationMixin<User>;
    declare getUsers: BelongsToManyGetAssociationsMixin<User>;

    async isUserInGroup(userID: number): Promise<boolean> {
        const user = await this.getUsers({
            where: { id: userID },
            attributes: ['id'], // on élimine le bruit
            joinTableAttributes: [] // pareil
        });

        return user.length > 0;
    }

    declare addUser: BelongsToManyAddAssociationMixin<User, number>;
    declare removeUser: BelongsToManyRemoveAssociationMixin<User, number>;

    declare getTracks: BelongsToManyGetAssociationsMixin<Track>;
    declare addTrack: BelongsToManyAddAssociationMixin<Track, number>;

    declare getPeriods: HasManyGetAssociationsMixin<GroupPeriod>;

    async getCurrentPeriod(): Promise<GroupPeriod | null> {
        logger.info(`Running getcurrentperiod for group ${this.id}`);
        const periods = await this.getPeriods({
            order: [['periodStart', 'ASC']]
        });
        const now = TimeManager.now();

        const current: GroupPeriod | undefined = periods.find((p: GroupPeriod, i: number) => {
            const next = periods[i + 1]?.periodStart ?? new Date("9999-12-31");
            return p.periodStart <= now && now < next;
        });

        const p = current ?? null;
        logger.info(`currentperiod: returning ${p}`);
        return p;
    }
    
    async canUserAdd(userID: number): Promise<boolean> {
        const currentPeriod = await this.getCurrentPeriod();
        if (!currentPeriod)
            return false;

        const currentUserTracks = await GroupPlaylist.findOne({
            where: {
                groupID: this.id,
                userID: userID,
                addedAt: {[Op.gte]: currentPeriod.periodStart}
            }
        });

        return !currentUserTracks;
    }

    async allUsersAdded(): Promise<boolean> {
        const users = await this.getUsers();
        const canAddChecks = await Promise.all(
            users.map(user => this.canUserAdd(user.id))
        );

        return canAddChecks.every(canAdd => !canAdd);
    }

    async updateChosenOne(transaction?: Transaction) {
        console.log(`updating chosen one for group ${this.id}`);

        const members = await this.getUsers({ transaction });

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
    
        // mtn on doit faire la MAJ dans la DB
        await this.update(
            {
                chosenOneUserID: nextChosenOne,
                status: GroupStatus.SUN_WAITING_THEME
            },
            { transaction }
        );
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