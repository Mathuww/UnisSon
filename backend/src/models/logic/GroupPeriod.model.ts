import { BelongsToGetAssociationMixin, CreationOptional, DataTypes, HasManyGetAssociationsMixin, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import Group from "../elem/Group.model.js";
import db from "../../dbpool.js";

export class GroupPeriod extends Model<
    InferAttributes<GroupPeriod>,
    InferCreationAttributes<GroupPeriod>
> {
    declare id: CreationOptional<number>;
    declare groupID: number;
    declare periodStart: Date;

    declare getGroup: BelongsToGetAssociationMixin<Group>;
    declare Group?: NonAttribute<Group>;
}

GroupPeriod.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    groupID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Group, key: 'id' }
    },
    periodStart: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'GroupPeriod'
});

export default GroupPeriod;