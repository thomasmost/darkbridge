import { Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';
import { toServiceProvider } from '../helpers/permissioners';

import { sequelize } from '../sequelize';
import { PermissionedModel } from './_prototypes';

enum InvoiceItemType {
  materials = 'materials',
  tax = 'tax',
}

/**
  invoice_id VARCHAR(255) NOT NULL,
  appointment_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount_in_minor_units INT NOT NULL,
  currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
  quantity INT NOT NULL DEFAULT 1, */
export interface InvoiceItemAttributes {
  id: string;
  created_at: number;
  invoice_id: string;
  service_provider_user_id: string;
  client_profile_id: string;
  type: InvoiceItemType;
  description: string;
  amount_in_minor_units: number;
  currency_code: string;
  quantity: number;
}

// Some attributes are optional in `InvoiceItem.build` and `InvoiceItem.create` calls
type InvoiceItemCreationAttributes = Optional<
  InvoiceItemAttributes,
  'id' | 'created_at'
>;

export class InvoiceItem
  extends PermissionedModel<
    InvoiceItemAttributes,
    InvoiceItemCreationAttributes
  >
  implements InvoiceItemAttributes {
  public id!: string;
  public invoice_id!: string;
  public service_provider_user_id!: string;
  public client_profile_id!: string;
  public type!: InvoiceItemType;
  public description!: string;
  public amount_in_minor_units!: number;
  public currency_code!: string;
  public quantity!: number;

  // timestamps!
  public readonly created_at!: number;
}

export const InvoiceItemModel = InvoiceItem.initWithPermissions(
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
    service_provider_user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toServiceProvider,
    },
    client_profile_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toServiceProvider,
    },
    invoice_id: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toServiceProvider,
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(InvoiceItemType),
      visible: toServiceProvider,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toServiceProvider,
    },
    quantity: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: 1,
      visible: toServiceProvider,
    },
    amount_in_minor_units: {
      type: DataTypes.NUMBER,
      allowNull: false,
      visible: toServiceProvider,
    },
    currency_code: {
      type: DataTypes.STRING,
      allowNull: false,
      visible: toServiceProvider,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'InvoiceItem',
    tableName: 'invoice_item',
    timestamps: false,
  },
);
