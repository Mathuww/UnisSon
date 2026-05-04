import {
    CreationOptional,
    DataTypes,
    InferAttributes, InferCreationAttributes,
    Model
} from 'sequelize';
import db from '../../shared/db.js';

/**
 * Représente le stockage l'offset de temps qui sert de base de calcul au temps fictif
 * Structure élémentaire.
 * Table à ligne unique (on utilise toujours le premier id).
 * @class
 */
export class TimeState extends Model<
    InferAttributes<TimeState>,
    InferCreationAttributes<TimeState>
> {
    declare id: CreationOptional<number>;
    declare offsetMs: CreationOptional<number>;
    declare offsetHrs: number;
}

TimeState.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    offsetHrs: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    offsetMs: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
}, {
    sequelize: db,
    timestamps: false,
    tableName: 'TimeState',
});

export default TimeState;