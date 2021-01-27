import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

// These are all the attributes in the Appointment model
interface AppointmentAttributes {
  id: string;
  created_at: number;
  created_by_user_id: string;
}

// Some attributes are optional in `Appointment.build` and `Appointment.create` calls
type AppointmentCreationAttributes = Optional<
  AppointmentAttributes,
  'id' | 'created_at'
>;

export class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes {
  public id!: string;
  public created_by_user_id!: string;

  // timestamps!
  public readonly created_at!: number;
}

Appointment.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: function () {
        return v4();
      },
    },
    created_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
    },
    created_by_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointment',
    timestamps: false,
  },
);
