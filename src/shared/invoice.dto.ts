import { InvoiceCreationAttributes } from '../models/invoice.model';
import { InvoiceItemAttributes } from '../models/invoice_item.model';

export interface IInvoicePostBody extends InvoiceCreationAttributes {
  appointment_id: string;
  invoice_items: InvoiceItemAttributes[];
}
