import {
    CreationOptional,
    DataTypes,
    InferAttributes, InferCreationAttributes,
    Model
} from 'sequelize';
import db from '../../shared/db.js';

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