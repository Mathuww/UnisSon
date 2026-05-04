import { BelongsToGetAssociationMixin, CreationOptional, DataTypes, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import User from "../elem/User.model.js";
import Group from "../elem/Group.model.js";
import db from "../../shared/db.js";

/**
 * Utile pour la planifications des notifs,
 * inutilisé pour l'instant.
 */
export class Notif extends Model<
    InferAttributes<Notif>,
    InferCreationAttributes<Notif>
> {
    declare id: CreationOptional<number>;
    declare userID: number;
    declare groupID: number;
    declare sendAt: Date | null;

    // Associations
    declare getGroup: BelongsToGetAssociationMixin<Group>;
    declare getUser: BelongsToGetAssociationMixin<User>;
}

Notif.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: 'id' }
    },
    groupID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Group, key : 'id' }
    },
    sendAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'Notifications'
});


export default Notif;