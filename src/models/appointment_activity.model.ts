import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

export enum AppointmentAction {
  canceled = 'canceled',
  completed = 'completed',
  edited = 'edited',
  missed = 'missed',
  paid = 'paid',
  requested = 'requested',
  rescheduled = 'rescheduled',
  scheduled = 'scheduled',
  started = 'started',
}

// These are all the attributes in the AppointmentActivity model
interface AppointmentActivityAttributes {
  id: string;
  created_at: number;
  recorded_at: number;
  acting_user_id: string;
  appointment_id: string;
  action: keyof typeof AppointmentAction;
  note: string;
  metadata_json: string;
}

// Some attributes are optional in `AppointmentActivity.build` and `AppointmentActivity.create` calls
type AppointmentActivityCreationAttributes = Optional<
  AppointmentActivityAttributes,
  'id' | 'created_at' | 'recorded_at' | 'note' | 'metadata_json'
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
  public metadata_json!: string;

  // timestamps!
  public readonly created_at!: number;
  // recorded_at is primarily for offline mobile devices that might log activity locally and sync it at the next opportunity
  public readonly recorded_at!: number;
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
    recorded_at: {
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
    metadata_json: {
      type: DataTypes.STRING,
      defaultValue: function () {
        return '{}';
      },
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
