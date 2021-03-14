import { Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';
import { toSelf } from '../helpers/permissioners';

import { sequelize } from '../sequelize';
import {
  ContractorProfile,
  ContractorProfileModel,
} from './contractor_profile.model';
import { PermissionedModel, RelationAttribute } from './_prototypes';

// These are all the attributes in the User model
export interface UserAttributes {
  id: string;
  created_at: number;
  family_name: string;
  given_name: string | null;
  email: string;
  phone: string;
  password_hash: string;
  password_salt: string;
  verified_at: number;
  contractor_profile?: ContractorProfile;
}

// Some attributes are optional in `User.build` and `User.create` calls
type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'created_at' | 'verified_at' | 'family_name' | 'given_name' | 'phone'
>;

export class User
  extends PermissionedModel<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public password_hash!: string;
  public password_salt!: string;
  public email!: string;
  public phone: string;
  public id!: string; // Note that the `null assertion` `!` is required in strict mode.
  public family_name!: string;
  public given_name!: string; // for nullable fields

  // timestamps
  public readonly created_at!: number;
  public verified_at!: number;

  // relations
  public contractor_profile?: ContractorProfile;
}

export const UserModel = User.initWithPermissions(
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
      visible: true,
    },
    verified_at: {
      type: DataTypes.NUMBER,
      allowNull: true,
      visible: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toSelf,
    },
    phone: {
      type: DataTypes.STRING,
      visible: toSelf,
    },
    family_name: {
      type: DataTypes.STRING,
      visible: toSelf,
    },
    given_name: {
      type: DataTypes.STRING,
      visible: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: false,
    },
    password_salt: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: false,
    },
    contractor_profile: {
      type: DataTypes.VIRTUAL,
      model: ContractorProfileModel,
      visible: toSelf,
    } as RelationAttribute,
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false,
  },
);
