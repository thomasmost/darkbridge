import { BadRequestError } from './error.helper';
import { Invoice, InvoiceAttributes } from '../models/invoice.model';
import { InvoiceItemAttributes } from '../models/invoice_item.model';
import { kirk } from './log.helper';

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
    throw new BadRequestError(
      `Expected an amount in minor units; received a decimal in field ${field}`,
    );
  }
}
export function validateInvoiceItem(item: InvoiceItemAttributes) {
  const { amount_in_minor_units, quantity } = item;
  if (
    typeof amount_in_minor_units === 'number' &&
    amount_in_minor_units % 1 !== 0
  ) {
    throw new BadRequestError(
      `Expected an amount in minor units; received a decimal in field amount_in_minor_units`,
    );
  }
  if (typeof quantity === 'number' && quantity % 1 !== 0) {
    throw new BadRequestError(
      `Expected an amount in minor units; received a decimal in field quantity`,
    );
  }
}

export function validateInvoice(invoice: Invoice) {
  kirk.info('Validating the invoice...');
  validateAmountField(invoice, 'hourly_rate');
  validateAmountField(invoice, 'daily_rate');
  validateAmountField(invoice, 'flat_rate');
  validateAmountField(invoice, 'minutes_billed');
  validateAmountField(invoice, 'days_billed');
}
