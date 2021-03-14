import { DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';
import { PermissionedModel } from './_prototypes';

export const Clients = {
  web: 'web',
  ios: 'ios',
  android: 'android',
};

export type ClientType = keyof typeof Clients;

// These are all the attributes in the AuthToken model
interface AuthTokenAttributes {
  id: string;
  created_at: number;
  last_used_at: number;
  disabled_at: number;
  auth_method: string;
  disabled_reason: string;
  user_id: string;
  client_type: ClientType;
  device_id: string;
}

// Some attributes are optional in `AuthToken.build` and `AuthToken.create` calls
type AuthTokenCreationAttributes = Pick<
  AuthTokenAttributes,
  'auth_method' | 'user_id' | 'client_type' | 'device_id'
>;

export class AuthToken
  extends PermissionedModel<AuthTokenAttributes, AuthTokenCreationAttributes>
  implements AuthTokenAttributes {
  public auth_method!: string;
  public disabled_reason: string;
  public id!: string;
  public user_id!: string;
  public client_type!: ClientType;
  public device_id!: string;

  // timestamps!
  public readonly created_at!: number;
  public readonly last_used_at!: number;
  public readonly disabled_at: number;
}

AuthToken.initWithPermissions(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: function () {
        return v4();
      },
      visible: true,
    },
    created_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
      visible: false,
    },
    last_used_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
      visible: false,
    },
    disabled_at: {
      type: DataTypes.NUMBER,
      allowNull: true,
      visible: false,
    },
    auth_method: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: false,
    },
    disabled_reason: {
      type: DataTypes.STRING,
      allowNull: true,
      visible: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: false,
    },
    client_type: {
      type: DataTypes.ENUM,
      values: Object.values(Clients),
      allowNull: false,
      visible: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: false,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'AuthToken',
    tableName: 'auth_token',
    timestamps: false,
  },
);
