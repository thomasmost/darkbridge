import { Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';
import { toServiceProvider } from '../helpers/permissioners';

import { sequelize } from '../sequelize';
import { InvoicePaymentMethod } from '../shared/enums';
import { InvoiceItemAttributes } from './invoice_item.model';
// import { InvoiceItemModel } from './invoice_item.model';
import { PermissionedModel } from './_prototypes';

export enum InvoiceStatus {
  pending = 'pending',
  paid = 'paid',
}

export interface InvoiceAttributes {
  id: string;
  created_at: number;
  service_provider_user_id: string;
  client_profile_id: string;
  status: InvoiceStatus;
  payment_method: InvoicePaymentMethod;
  flat_rate: number;
  processing_fee: number;
  hourly_rate: number;
  daily_rate: number;
  minutes_billed: number;
  days_billed: number;
  total_from_line_items: number;
  currency_code: string;
  invoice_items: InvoiceItemAttributes[];
}

// Some attributes are optional in `Invoice.build` and `Invoice.create` calls
export type InvoiceCreationAttributes = Optional<
  InvoiceAttributes,
  'id' | 'created_at' | 'invoice_items'
>;

export class Invoice
  extends PermissionedModel<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes {
  public id!: string;
  public service_provider_user_id!: string;
  public client_profile_id!: string;
  public status!: InvoiceStatus;
  public payment_method!: InvoicePaymentMethod;
  public flat_rate!: number;
  public cost_materials!: number;
  public processing_fee!: number;
  public hourly_rate!: number;
  public daily_rate!: number;
  public minutes_billed!: number;
  public days_billed!: number;
  public total_from_line_items!: number;
  public currency_code!: string;
  public invoice_items: InvoiceItemAttributes[];

  // timestamps!
  public readonly created_at!: number;
}

export const InvoiceModel = Invoice.initWithPermissions(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      defaultValue: function () {
        return v4();
      },
      visible: toServiceProvider,
    },
    created_at: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: function () {
        return Date.now();
      },
      visible: toServiceProvider,
    },
    client_profile_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toServiceProvider,
    },
    service_provider_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toServiceProvider,
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(InvoiceStatus),
      visible: toServiceProvider,
    },
    payment_method: {
      type: DataTypes.ENUM,
      values: Object.values(InvoicePaymentMethod),
      visible: toServiceProvider,
    },
    flat_rate: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
      visible: toServiceProvider,
    },
    processing_fee: {
      type: DataTypes.NUMBER,
      allowNull: false,
      visible: toServiceProvider,
    },
    daily_rate: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
      visible: toServiceProvider,
    },
    hourly_rate: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
      visible: toServiceProvider,
    },
    minutes_billed: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
      visible: toServiceProvider,
    },
    days_billed: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 0,
      visible: toServiceProvider,
    },
    currency_code: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toServiceProvider,
    },
    total_from_line_items: {
      type: DataTypes.NUMBER,
      allowNull: false,
      visible: toServiceProvider,
    },
    invoice_items: {
      type: DataTypes.VIRTUAL,
      visible: toServiceProvider,
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
