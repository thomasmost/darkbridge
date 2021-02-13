import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

export const AppointmentStatus = {
  requested: 'requested',
  scheduled: 'scheduled',
  canceled: 'canceled',
  completed: 'completed',
};

// These are all the attributes in the Appointment model
interface AppointmentAttributes {
  id: string;
  created_at: number;
  // (future) in the future appointment requests might also be stored in this table;
  // we might then want a separate 'created_by_user_id' field
  service_provider_user_id: string;
  // (future) in the future we may want to separate addresses from the client profile
  // since a client could move or there might be multiple addresses belonging to a client
  // address_id: string;
  client_profile_id: string;
  status: keyof typeof AppointmentStatus;
  datetime_local: string;
  datetime_utc: string;
  timezone: string;
  duration_minutes: number;
  rating_of_service: number;
  rating_of_client: number;
}

// Some attributes are optional in `Appointment.build` and `Appointment.create` calls
export type AppointmentCreationAttributes = Optional<
  AppointmentAttributes,
  'id' | 'created_at' | 'status' | 'rating_of_client' | 'rating_of_service'
>;

export class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes {
  public id!: string;
  public service_provider_user_id!: string;
  public client_profile_id!: string;
  public status!: keyof typeof AppointmentStatus;
  public datetime_local!: string;
  public datetime_utc!: string;
  public timezone!: string;
  public duration_minutes!: number;
  public rating_of_service: number;
  public rating_of_client: number;

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
    service_provider_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(AppointmentStatus),
    },
    client_profile_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datetime_local: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    datetime_utc: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    rating_of_client: {
      type: DataTypes.NUMBER,
    },
    rating_of_service: {
      type: DataTypes.NUMBER,
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
