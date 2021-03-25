import { InvoiceCreationAttributes } from '../models/invoice.model';
import { InvoiceItemPostBody } from '../models/invoice_item.model';

export interface IInvoicePostBody
  extends Omit<
    InvoiceCreationAttributes,
    | 'invoice_items'
    | 'client_profile_id'
    | 'service_provider_user_id'
    | 'status'
    | 'total_from_line_items'
  > {
  appointment_id: string;
  invoice_items: InvoiceItemPostBody[];
}
