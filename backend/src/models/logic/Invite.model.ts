import { BelongsToGetAssociationMixin, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import Group from "../elem/Group.model.js";
import db from "../../shared/db.js";
import User from "../elem/User.model.js";

export class Invite extends Model<
    InferAttributes<Invite>,
    InferCreationAttributes<Invite>
> {
    declare id: CreationOptional<number>;
    declare token: string;
    declare groupID: number;
    declare inviterUserID: number;
    declare expiresAt: Date;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare getGroup: BelongsToGetAssociationMixin<Group>;
    declare getInviterUser: BelongsToGetAssociationMixin<User>;
}

Invite.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING(400),
        allowNull: false
    },
    groupID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Group,  key: 'id' }
    },
    inviterUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User,  key: 'id' }
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    sequelize: db,
    timestamps: true,
    modelName: 'Invitations'
});

export default Invite;