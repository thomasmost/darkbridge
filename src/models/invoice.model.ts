import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

export enum InvoiceStatus {
  pending = 'pending',
  paid = 'paid',
}

export enum InvoicePaymentMethod {
  cash = 'cash',
  credit_card = 'credit_card',
}

interface InvoiceAttributes {
  id: string;
  created_at: number;
  service_provider_user_id: string;
  client_profile_id: string;
  status: InvoiceStatus;
  payment_method: InvoicePaymentMethod;
  cost_materials: number;
  flat_rate: number;
  processing_fee: number;
  hourly_rate: number;
  daily_rate: number;
  minutes_billed: number;
  days_billed: number;
  currency_code: string;
}

// Some attributes are optional in `Invoice.build` and `Invoice.create` calls
export type InvoiceCreationAttributes = Optional<
  InvoiceAttributes,
  'id' | 'created_at' | 'payment_method'
>;

export class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes {
  public id!: string;
  public service_provider_user_id!: string;
  public client_profile_id!: string;
  public appointment_id!: string;
  public status!: InvoiceStatus;
  public payment_method!: InvoicePaymentMethod;
  public flat_rate!: number;
  public cost_materials!: number;
  public processing_fee!: number;
  public hourly_rate!: number;
  public daily_rate!: number;
  public minutes_billed!: number;
  public days_billed!: number;
  public currency_code!: string;

  // timestamps!
  public readonly created_at!: number;
}

export const InvoiceModel = Invoice.init(
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
    client_profile_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    service_provider_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(InvoiceStatus),
    },
    payment_method: {
      type: DataTypes.ENUM,
      values: Object.values(InvoicePaymentMethod),
    },
    flat_rate: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    cost_materials: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    processing_fee: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    daily_rate: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    hourly_rate: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    minutes_billed: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    days_billed: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
    },
    currency_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoice',
    timestamps: false,
  },
);
