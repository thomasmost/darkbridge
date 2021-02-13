import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

const PrimaryWork = {
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
}

// Some attributes are optional in `ContractorProfile.build` and `ContractorProfile.create` calls
type ContractorProfileCreationAttributes = Optional<
  ContractorProfileAttributes,
  'id' | 'created_at'
>;

export class ContractorProfile
  extends Model<
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

  // timestamps!
  public readonly created_at!: number;
}

ContractorProfile.init(
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
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
    },
    license_number: {
      type: DataTypes.STRING,
    },
    licensing_state: {
      type: DataTypes.STRING,
    },
    primary_work: {
      type: DataTypes.ENUM,
      values: Object.values(PrimaryWork),
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
