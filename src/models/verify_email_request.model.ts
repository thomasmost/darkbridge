import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

// These are all the attributes in the VerifyEmailRequest model
interface VerifyEmailRequestAttributes {
  verification_token: string;
  created_at: number;
  fulfilled_at: number;
  email: string;
  email_type: string;
  user_id: string;
}

// Some attributes are optional in `VerifyEmailRequest.build` and `VerifyEmailRequest.create` calls
type VerifyEmailRequestCreationAttributes = Optional<
  VerifyEmailRequestAttributes,
  'verification_token' | 'created_at' | 'fulfilled_at'
>;

export class VerifyEmailRequest
  extends Model<
    VerifyEmailRequestAttributes,
    VerifyEmailRequestCreationAttributes
  >
  implements VerifyEmailRequestAttributes {
  public email_type!: string;
  public email!: string;
  public user_id!: string;
  public verification_token!: string;

  // timestamps!
  public readonly created_at!: number;
  public fulfilled_at: number;
}

VerifyEmailRequest.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email_type: {
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
    modelName: 'VerifyEmailRequest',
    tableName: 'verify_email_request',
    timestamps: false,
  },
);
