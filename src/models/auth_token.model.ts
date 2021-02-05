import { Model, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

export const ClientType = {
  web: 'web',
  ios: 'ios',
  android: 'android',
};

// These are all the attributes in the AuthToken model
interface AuthTokenAttributes {
  id: string;
  created_at: number;
  last_used_at: number;
  disabled_at: number;
  auth_method: string;
  disabled_reason: string;
  user_id: string;
  client_type: keyof typeof ClientType;
  device_id: string;
}

// Some attributes are optional in `AuthToken.build` and `AuthToken.create` calls
type AuthTokenCreationAttributes = Pick<
  AuthTokenAttributes,
  'auth_method' | 'user_id'
>;

export class AuthToken
  extends Model<AuthTokenAttributes, AuthTokenCreationAttributes>
  implements AuthTokenAttributes {
  public auth_method!: string;
  public disabled_reason: string;
  public id!: string;
  public user_id!: string;
  public client_type!: keyof typeof ClientType;
  public device_id!: string;

  // timestamps!
  public readonly created_at!: number;
  public readonly last_used_at!: number;
  public readonly disabled_at: number;
}

AuthToken.init(
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
    last_used_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
    },
    disabled_at: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    auth_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    disabled_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client_type: {
      type: DataTypes.ENUM,
      values: Object.values(ClientType),
      allowNull: false,
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: false,
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
