import { differenceInMinutes } from 'date-fns';
import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';
import { ClientProfileAttributes } from './client_profile.model';
import { DateTimeHelper } from '../helpers/datetime.helper';

export const AppointmentStatus = {
  requested: 'requested',
  scheduled: 'scheduled',
  canceled: 'canceled',
  completed: 'completed',
};

export const AppointmentPriority = {
  p0_emergency: 'P0',
  p1_urgent: 'P1',
  p2_earliest_convenience: 'P2',
  p3_discretionary: 'P3',
};

// These are all the attributes in the Appointment model
export interface AppointmentAttributes {
  id: string;
  created_at: number;
  // (future) in the future appointment requests might also be stored in this table;
  // we might then want a separate 'created_by_user_id' field
  service_provider_user_id: string;
  // (future) in the future we may want to separate addresses from the client profile and the appointment and have them be first class entities
  // since a client could move or there might be multiple addresses belonging to a client
  // address_id: string;
  client_profile_id: string;
  status: keyof typeof AppointmentStatus;
  priority: keyof typeof AppointmentPriority;
  summary: string;
  notes: string;
  datetime_local: string;
  datetime_utc: string;
  datetime_end_local: string;
  datetime_end_utc: string;
  // Address fields will be copied from the client_profile
  // since the client could move, but the appointment's address should remain the same
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  timezone: string;
  timezone_offset: number;
  timezone_friendly: string;
  duration_minutes: number;
  rating_of_service: number;
  rating_of_client: number;
  client_profile?: ClientProfileAttributes;
}

export interface IAppointmentPostBody {
  client_profile_id: string;
  datetime_local: string;
  duration_minutes: number;
  priority: keyof typeof AppointmentPriority;
  summary: string;
}

// Some attributes are optional in `Appointment.build` and `Appointment.create` calls
export type AppointmentCreationAttributes = Omit<
  AppointmentAttributes,
  | 'id'
  | 'created_at'
  | 'status'
  | 'rating_of_client'
  | 'rating_of_service'
  | 'notes'
  | 'datetime_local'
  | 'datetime_end_local'
  | 'duration_minutes'
  | 'timezone_friendly'
>;

export class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes {
  public id!: string;
  public service_provider_user_id!: string;
  public client_profile_id!: string;
  public status!: keyof typeof AppointmentStatus;
  public priority!: keyof typeof AppointmentPriority;
  public datetime_local!: string;
  public datetime_utc!: string;
  public datetime_end_local!: string;
  public datetime_end_utc!: string;
  public address_street!: string;
  public address_city!: string;
  public address_state!: string;
  public duration_minutes!: number;
  public address_postal_code!: string;
  public timezone!: string;
  public timezone_offset!: number;
  public timezone_friendly!: string;
  public summary!: string;
  public notes: string;
  public rating_of_service: number;
  public rating_of_client: number;
  public client_profile: ClientProfileAttributes;

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
      defaultValue: function () {
        return AppointmentStatus.scheduled;
      },
    },
    priority: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(AppointmentPriority),
    },
    client_profile_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    datetime_utc: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    datetime_end_utc: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    datetime_local: {
      type: DataTypes.VIRTUAL,
      get: function () {
        const date = new Date(this.getDataValue('datetime_utc'));
        const timezone = this.getDataValue('timezone');
        return DateTimeHelper.toLocal(date, timezone);
      },
    },
    datetime_end_local: {
      type: DataTypes.VIRTUAL,
      get: function () {
        const date = new Date(this.getDataValue('datetime_end_utc'));
        const timezone = this.getDataValue('timezone');
        return DateTimeHelper.toLocal(date, timezone);
      },
    },
    address_street: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address_postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timezone_offset: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    timezone_friendly: {
      type: DataTypes.VIRTUAL,
      get: function () {
        const timezone = this.getDataValue('timezone');
        return timezone.replace(/_/, ' ');
      },
    },
    summary: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.VIRTUAL,
      get: function () {
        const startDate = new Date(this.getDataValue('datetime_utc'));
        const endDate = new Date(this.getDataValue('datetime_end_utc'));
        return differenceInMinutes(endDate, startDate);
      },
    },
    rating_of_client: {
      type: DataTypes.NUMBER,
    },
    rating_of_service: {
      type: DataTypes.NUMBER,
    },
    client_profile: {
      type: DataTypes.VIRTUAL,
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
