import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

// These are all the attributes in the ResetPasswordRequest model
interface ResetPasswordRequestAttributes {
  verification_token: string;
  created_at: number;
  fulfilled_at: number;
  email_sent_to: string;
  user_id: string;
}

// Some attributes are optional in `ResetPasswordRequest.build` and `ResetPasswordRequest.create` calls
type ResetPasswordRequestCreationAttributes = Optional<
  ResetPasswordRequestAttributes,
  'verification_token' | 'created_at' | 'fulfilled_at'
>;

export class ResetPasswordRequest
  extends Model<
    ResetPasswordRequestAttributes,
    ResetPasswordRequestCreationAttributes
  >
  implements ResetPasswordRequestAttributes {
  public email_sent_to!: string;
  public user_id!: string;
  public verification_token!: string;

  // timestamps!
  public readonly created_at!: number;
  public fulfilled_at: number;
}

ResetPasswordRequest.init(
  {
    // Model attributes are defined here
    verification_token: {
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
    fulfilled_at: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    email_sent_to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'ResetPasswordRequest',
    tableName: 'reset_password_request',
    timestamps: false,
  },
);
