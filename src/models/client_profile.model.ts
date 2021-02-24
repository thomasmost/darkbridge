import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

// These are all the attributes in the ClientProfile model
export interface ClientProfileAttributes {
  id: string;
  created_at: number;
  created_by_user_id: string;
  email: string;
  full_name: string;
  phone: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  timezone: string;
}

// Some attributes are optional in `ClientProfile.build` and `ClientProfile.create` calls
export type ClientProfileCreationAttributes = Optional<
  ClientProfileAttributes,
  'id' | 'created_at'
>;
export class ClientProfile
  extends Model<ClientProfileAttributes, ClientProfileCreationAttributes>
  implements ClientProfileAttributes {
  public id!: string;
  public created_by_user_id!: string;
  public email!: string;
  public full_name: string;
  public phone!: string;
  public address_street!: string;
  public address_city!: string;
  public address_state!: string;
  public address_postal_code!: string;
  public timezone!: string;

  // timestamps!
  public readonly created_at!: number;
}

ClientProfile.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
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
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'ClientProfile',
    tableName: 'client_profile',
    timestamps: false,
  },
);
