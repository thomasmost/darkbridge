import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

export const AppointmentAction = {
  rescheduled: 'rescheduled',
  canceled: 'canceled',
  edited: 'edited',
};

// These are all the attributes in the AppointmentActivity model
interface AppointmentActivityAttributes {
  id: string;
  created_at: number;
  acting_user_id: string;
  appointment_id: string;
  action: keyof typeof AppointmentAction;
  note: string;
}

// Some attributes are optional in `AppointmentActivity.build` and `AppointmentActivity.create` calls
type AppointmentActivityCreationAttributes = Optional<
  AppointmentActivityAttributes,
  'id' | 'created_at'
>;

export class AppointmentActivity
  extends Model<
    AppointmentActivityAttributes,
    AppointmentActivityCreationAttributes
  >
  implements AppointmentActivityAttributes {
  public id!: string;
  public acting_user_id!: string;
  public appointment_id!: string;
  public action!: keyof typeof AppointmentAction;
  public note!: string;

  // timestamps!
  public readonly created_at!: number;
}

AppointmentActivity.init(
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
    acting_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appointment_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(AppointmentAction),
    },
    note: {
      type: DataTypes.STRING,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'AppointmentActivity',
    tableName: 'appointment_activity',
    timestamps: false,
  },
);
