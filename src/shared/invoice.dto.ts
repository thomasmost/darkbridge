import { InvoiceCreationAttributes } from '../models/invoice.model';
import { InvoiceItemPostBody } from '../models/invoice_item.model';
import { InvoicePaymentMethod } from './enums';

export interface IInvoiceFormValues {
  flat_rate_in_major_units: number;
  processing_fee: number;
  hourly_rate_in_major_units: number;
  daily_rate_in_major_units: number;
  minutes_billed: number;
  days_billed: number;
  payment_method: InvoicePaymentMethod;
  state_tax_rate: number;
  local_tax_rate: number;
}

export interface IInvoiceCore
  extends Omit<
    InvoiceCreationAttributes,
    | 'invoice_items'
    | 'client_profile_id'
    | 'service_provider_user_id'
    | 'status'
    | 'total_from_line_items'
  > {
  invoice_items: InvoiceItemPostBody[];
  client_secret?: string;
}

export interface IInvoicePostBody
  extends IInvoiceFormValues,
    Omit<
      InvoiceCreationAttributes,
      | 'invoice_items'
      | 'client_profile_id'
      | 'service_provider_user_id'
      | 'status'
      | 'total_from_line_items'
    > {
  appointment_id: string;
  invoice_items: InvoiceItemPostBody[];
  client_secret?: string;
}
