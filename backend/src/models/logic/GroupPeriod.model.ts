import { BelongsToGetAssociationMixin, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "sequelize";
import db from "../../shared/db.js";
import { PeriodType } from "../../shared/PeriodType.js";
import Group from "../elem/Group.model.js";

/**
 * Représente les jobs à effectuer pour chaque groupe,
 * puisque chaque job correspond à une nouvelle période pour le groupe.
 */
export class GroupPeriod extends Model<
    InferAttributes<GroupPeriod>,
    InferCreationAttributes<GroupPeriod>
> {
    declare id: CreationOptional<number>;
    declare groupID: number;
    declare periodStart: Date;
    declare periodType: PeriodType;
    // Pour ne jamais process un job deux fois
    declare processedAt: Date | null;

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
    },
    periodType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'GroupPeriod'
});

export default GroupPeriod;