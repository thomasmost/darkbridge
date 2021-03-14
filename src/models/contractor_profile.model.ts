import { Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';
import { toUser } from '../helpers/permissioners';

import { sequelize } from '../sequelize';
import { PermissionedModel } from './_prototypes';

export const PrimaryWork = {
  electrical: 'electrical',
  hvac: 'hvac',
  plumbing: 'plumbing',
  carpentry: 'carpentry',
  handiwork: 'handiwork',
};

// These are all the attributes in the ContractorProfile model
export interface ContractorProfileAttributes {
  id: string;
  created_at: number;
  user_id: string;
  company_name: string;
  license_number: string;
  licensing_state: string;
  primary_work: keyof typeof PrimaryWork;
  appointment_fee: number;
  hourly_rate: number;
  daily_rate: number;
  estimated_yearly_income: number;
  estimated_yearly_expenses: number;
}

// Some attributes are optional in `ContractorProfile.build` and `ContractorProfile.create` calls
type ContractorProfileCreationAttributes = Optional<
  ContractorProfileAttributes,
  'id' | 'created_at'
>;

export type ContractorProfileUpdateAttributes = Omit<
  ContractorProfileAttributes,
  'id' | 'created_at' | 'user_id'
>;

export class ContractorProfile
  extends PermissionedModel<
    ContractorProfileAttributes,
    ContractorProfileCreationAttributes
  >
  implements ContractorProfileAttributes {
  public id!: string;
  public user_id!: string;
  public company_name!: string;
  public license_number!: string;
  public licensing_state!: string;
  public primary_work!: keyof typeof PrimaryWork;

  public appointment_fee: number;
  public hourly_rate: number;
  public daily_rate: number;
  public estimated_yearly_income: number;
  public estimated_yearly_expenses: number;

  // timestamps!
  public readonly created_at!: number;
}

export const ContractorProfileModel = ContractorProfile.initWithPermissions(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: function () {
        return v4();
      },
      visible: toUser,
    },
    created_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
      visible: toUser,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toUser,
    },
    company_name: {
      type: DataTypes.STRING,
      visible: toUser,
    },
    license_number: {
      type: DataTypes.STRING,
      visible: toUser,
    },
    licensing_state: {
      type: DataTypes.STRING,
      visible: toUser,
    },
    primary_work: {
      type: DataTypes.ENUM,
      values: Object.values(PrimaryWork),
      visible: toUser,
    },
    appointment_fee: {
      type: DataTypes.NUMBER,
      visible: toUser,
    },
    hourly_rate: {
      type: DataTypes.NUMBER,
      visible: toUser,
    },
    daily_rate: {
      type: DataTypes.NUMBER,
      visible: toUser,
    },
    estimated_yearly_income: {
      type: DataTypes.NUMBER,
      visible: toUser,
    },
    estimated_yearly_expenses: {
      type: DataTypes.NUMBER,
      visible: toUser,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'ContractorProfile',
    tableName: 'contractor_profile',
    timestamps: false,
  },
);
