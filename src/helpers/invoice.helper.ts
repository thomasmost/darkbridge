import { InvoiceAttributes } from '../models/invoice.model';

export function totalToBePaidOut(invoice: InvoiceAttributes) {
  const {
    daily_rate,
    hourly_rate,
    minutes_billed,
    days_billed,
    flat_rate,
    total_from_line_items,
  } = invoice;
  return (
    daily_rate * days_billed +
    Math.ceil((hourly_rate * minutes_billed) / 60) +
    flat_rate +
    total_from_line_items
  );
}
