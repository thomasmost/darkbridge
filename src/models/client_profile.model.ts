import { Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';
import { toCreator } from '../helpers/permissioners';

import { sequelize } from '../sequelize';
import { PermissionedModel } from './_prototypes';

// These are all the attributes in the ClientProfile model
export interface ClientProfileAttributes {
  id: string;
  created_at: number;
  created_by_user_id: string;
  email: string;
  given_name: string;
  family_name: string;
  readonly full_name: string;
  phone: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_postal_code: string;
  timezone: string;
  timezone_offset: number;
  coordinates: Readonly<{
    type: string;
    coordinates: Readonly<Readonly<number>[]>;
  }>;
  stripe_customer_id: string;
}

// Some attributes are optional in `ClientProfile.build` and `ClientProfile.create` calls
export type ClientProfileCreationAttributes = Omit<
  Optional<ClientProfileAttributes, 'id' | 'created_at' | 'coordinates'>,
  'full_name' | 'stripe_customer_id'
>;
export class ClientProfile
  extends PermissionedModel<
    ClientProfileAttributes,
    ClientProfileCreationAttributes
  >
  implements ClientProfileAttributes {
  public id!: string;
  public created_by_user_id!: string;
  public email!: string;
  public given_name: string;
  public family_name: string;
  public readonly full_name: string;
  public phone!: string;
  public address_street!: string;
  public address_city!: string;
  public address_state!: string;
  public address_postal_code!: string;
  public timezone!: string;
  public timezone_offset!: number;
  public coordinates!: { type: string; coordinates: number[] };
  public stripe_customer_id!: string;

  // timestamps!
  public readonly created_at!: number;
}

export const ClientProfileModel = ClientProfile.initWithPermissions(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: function () {
        return v4();
      },
      visible: toCreator,
    },
    created_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
      visible: toCreator,
    },
    created_by_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    given_name: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    family_name: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    full_name: {
      type: DataTypes.VIRTUAL,
      get: function () {
        const given_name = this.getDataValue('given_name');
        const family_name = this.getDataValue('family_name');
        return `${given_name} ${family_name}`;
      },
      set: function () {
        throw Error(`full_name is a VIRTUAL; it should not be set directly`);
      },
      visible: toCreator,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    address_street: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    address_city: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    address_state: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    address_postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toCreator,
    },
    timezone_offset: {
      type: DataTypes.NUMBER,
      allowNull: false,
      visible: toCreator,
    },
    // This should not be allowed to be null, but because of this bug: https://github.com/sequelize/sequelize/issues/13086
    // we have to set it separately with a Sequelize query literal.
    coordinates: {
      type: DataTypes.GEOGRAPHY('POINT', 4326),
      allowNull: true,
      visible: false,
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
      visible: false,
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
