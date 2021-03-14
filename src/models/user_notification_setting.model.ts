import { Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';
import { toUser } from '../helpers/permissioners';
import { NotificationSettingsHelper } from '../helpers/user_settings.helper';

import { sequelize } from '../sequelize';
import { PermissionedModel } from './_prototypes';

export enum UserNotification {
  daily_kickoff = 'daily_kickoff',
  appointment_reminder = 'appointment_reminder',
  start_work_reminder = 'start_work_reminder',
}

// These are all the attributes in the UserNotificationSetting model
interface UserNotificationSettingAttributes {
  id: string;
  created_at: number;
  updated_at: number;
  name: string;
  user_id: string;
  notification_id: UserNotification;
  email: boolean;
  push: boolean;
  text: boolean;
}

// Some attributes are optional in `UserNotificationSetting.build` and `UserNotificationSetting.create` calls
type UserNotificationSettingCreationAttributes = Optional<
  UserNotificationSettingAttributes,
  'id' | 'created_at' | 'updated_at' | 'name'
>;

export class UserNotificationSetting
  extends PermissionedModel<
    UserNotificationSettingAttributes,
    UserNotificationSettingCreationAttributes
  >
  implements UserNotificationSettingAttributes {
  public id!: string;
  public user_id!: string;
  public name!: string;
  public notification_id!: UserNotification;
  public email!: boolean;
  public push!: boolean;
  public text!: boolean;

  // timestamps!
  public readonly created_at!: number;
  public updated_at!: number;
}

export const UserNotificationSettingModel = UserNotificationSetting.initWithPermissions(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: function () {
        return v4();
      },
      visible: toUser,
    },
    created_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
      visible: toUser,
    },
    updated_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
      visible: toUser,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toUser,
    },
    name: {
      type: DataTypes.VIRTUAL(DataTypes.STRING),
      get: function () {
        const notification_id = this.getDataValue(
          'notification_id',
        ) as UserNotification;
        return NotificationSettingsHelper.defaults()[notification_id].name;
      },
      visible: toUser,
    },
    notification_id: {
      type: DataTypes.ENUM(
        ...Object.keys(UserNotification as { [key: string]: string }),
      ),
      allowNull: false,
      visible: toUser,
    },
    email: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      visible: toUser,
    },
    push: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      visible: toUser,
    },
    text: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      visible: toUser,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'UserNotificationSetting',
    tableName: 'user_notification_setting',
    timestamps: false,
  },
);
