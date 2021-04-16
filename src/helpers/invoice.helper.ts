import { ValidationError } from 'sequelize';
import { Invoice, InvoiceAttributes } from '../models/invoice.model';

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

function validateAmountField(invoice: Invoice, field: keyof Invoice) {
  const value = invoice[field];
  if (value === null || value === undefined) {
    return;
  }
  if (typeof value === 'number' && value % 1 !== 0) {
    throw new ValidationError(
      `Expected an amount in minor units; received a decimal in field ${field}`,
    );
  }
}

export function validateInvoice(invoice: Invoice) {
  validateAmountField(invoice, 'hourly_rate');
  validateAmountField(invoice, 'daily_rate');
  validateAmountField(invoice, 'flat_rate');
  validateAmountField(invoice, 'minutes_billed');
  validateAmountField(invoice, 'days_billed');
}
