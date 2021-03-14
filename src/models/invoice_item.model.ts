import { Model, Optional, DataTypes } from 'sequelize';
import { v4 } from 'uuid';

import { sequelize } from '../sequelize';

enum InvoiceItemType {
  materials = 'materials',
}

/**
  invoice_id VARCHAR(255) NOT NULL,
  appointment_id VARCHAR(255) NOT NULL,
  type VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  amount_in_minor_units INT NOT NULL,
  currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
  quantity INT NOT NULL DEFAULT 1, */
interface InvoiceItemAttributes {
  id: string;
  created_at: number;
  invoice_id: string;
  appointment_id: string;
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
  extends Model<InvoiceItemAttributes, InvoiceItemCreationAttributes>
  implements InvoiceItemAttributes {
  public id!: string;
  public invoice_id!: string;
  public appointment_id!: string;
  public type!: InvoiceItemType;
  public description!: string;
  public amount_in_minor_units!: number;
  public currency_code!: string;
  public quantity!: number;

  // timestamps!
  public readonly created_at!: number;
}

InvoiceItem.init(
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
    appointment_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoice_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: Object.values(InvoiceItemType),
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.NUMBER,
      allowNull: false,
      defaultValue: () => 1,
    },
    amount_in_minor_units: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    currency_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize,
    modelName: 'InvoiceItem',
    tableName: 'invoice',
    timestamps: false,
  },
);
