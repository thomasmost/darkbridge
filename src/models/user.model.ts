import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';
import {
  ContractorProfile,
  ContractorProfileModel,
} from './contractor_profile.model';
import { RelationAttribute } from './types';

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
  extends Model<UserAttributes, UserCreationAttributes>
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

export const UserModel = User.init(
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
    verified_at: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
    family_name: {
      type: DataTypes.STRING,
    },
    given_name: {
      type: DataTypes.STRING,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contractor_profile: {
      type: DataTypes.VIRTUAL,
      model: ContractorProfileModel,
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

export function permissionUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    given_name: user.given_name,
    family_name: user.family_name,
    created_at: user.created_at,
    verified_at: user.verified_at,
    contractor_profile: user.contractor_profile,
  };
}
