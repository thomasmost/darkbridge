import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

// These are all the attributes in the User model
interface UserAttributes {
  id: string;
  created_at: number;
  family_name: string;
  given_name: string | null;
  email: string;
  password_hash: string;
  password_salt: string;
}

// Some attributes are optional in `User.build` and `User.create` calls
type UserCreationAttributes = Optional<UserAttributes, 'id' | 'created_at'>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public password_hash!: string;
  public password_salt!: string;
  public email!: string;
  public id!: string; // Note that the `null assertion` `!` is required in strict mode.
  public family_name!: string;
  public given_name!: string; // for nullable fields

  // timestamps!
  public readonly created_at!: number;
  public verified_at!: number;
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    family_name: {
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
    given_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: false,
  },
);
