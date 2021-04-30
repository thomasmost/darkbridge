import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

// These are all the attributes in the ClientConfirmationRequest model
interface ClientConfirmationRequestAttributes {
  verification_token: string;
  created_at: number;
  fulfilled_at: number;
  fulfilled_with: string;
  email_sent_to: string;
  client_profile_id: string;
  appointment_id: string;
}

// Some attributes are optional in `ClientConfirmationRequest.build` and `ClientConfirmationRequest.create` calls
type ClientConfirmationRequestCreationAttributes = Optional<
  ClientConfirmationRequestAttributes,
  'verification_token' | 'created_at' | 'fulfilled_at' | 'fulfilled_with'
>;

export class ClientConfirmationRequest
  extends Model<
    ClientConfirmationRequestAttributes,
    ClientConfirmationRequestCreationAttributes
  >
  implements ClientConfirmationRequestAttributes {
  public email_sent_to!: string;
  public verification_token!: string;
  public client_profile_id!: string;
  public appointment_id!: string;
  public fulfilled_with: string;

  // timestamps!
  public readonly created_at!: number;
  public fulfilled_at: number;
}

ClientConfirmationRequest.init(
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
    fulfilled_with: {
      type: DataTypes.STRING,
    },
    email_sent_to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    client_profile_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    appointment_id: {
      type: DataTypes.STRING,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'ClientConfirmationRequest',
    tableName: 'client_setup_request',
    timestamps: false,
  },
);
