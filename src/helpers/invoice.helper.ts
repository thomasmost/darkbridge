import { BadRequestError } from './error.helper';
import { Invoice, InvoiceAttributes } from '../models/invoice.model';
import { InvoiceItemAttributes } from '../models/invoice_item.model';
import { kirk } from './log.helper';
import { toMajorUnits } from './currency.helper';
import { InvoiceItemType, InvoicePaymentMethod } from '../shared/enums';
import { Appointment } from '../models/appointment.model';
import { ClientProfile } from '../models/client_profile.model';
import { format } from 'date-fns-tz';
import { constructEmail, invoiceReceiptTemplate } from './email.helper';
import { orderEmail } from '../task';
import { User } from '../models/user.model';

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
  const { amount_in_minor_units, quantity, description, type } = item;
  if (!type) {
    throw new BadRequestError(`Invoice items must have a type`);
  }
  if (!description) {
    throw new BadRequestError(`Invoice items must have a description`);
  }
  if (typeof amount_in_minor_units !== 'number') {
    throw new BadRequestError(
      `Expected a numeric amount_in_minor_units; received a ${typeof amount_in_minor_units}`,
    );
  }
  if (typeof quantity !== 'number' && Number.isNaN(parseInt(quantity, 10))) {
    throw new BadRequestError(
      `Expected a numeric quantity; received a ${typeof quantity}`,
    );
  }
  if (amount_in_minor_units % 1 !== 0) {
    throw new BadRequestError(
      `Expected an amount in minor units; received a decimal in field amount_in_minor_units`,
    );
  }
  if (quantity % 1 !== 0) {
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

export function timeRows(invoice: Invoice) {
  let timeRows = '';
  if (invoice.flat_rate) {
    timeRows += `
      <tr>
        <td style="padding-bottom: 10px;">Appointment Fee</td>
        <td style="padding-bottom: 10px; text-align: right;">$${toMajorUnits(
          invoice.flat_rate,
        )}</td>
      </tr>
    `;
  }
  if (invoice.minutes_billed) {
    timeRows += `
      <tr>
        <td style="padding-bottom: 10px;">Time</td>
        <td style="padding-bottom: 10px; text-align: right;">$${toMajorUnits(
          Math.ceil((invoice.hourly_rate * invoice.minutes_billed) / 60),
        )}</td>
      </tr>
    `;
    return timeRows;
  }
  if (invoice.days_billed) {
    timeRows += `
      <tr>
        <td style="padding-bottom: 10px;">Time</td>
        <td style="padding-bottom: 10px; text-align: right;">$${toMajorUnits(
          invoice.daily_rate * invoice.days_billed,
        )}</td>
      </tr>
    `;
  }
  return timeRows;
}

export function materialsRows(invoice: Invoice) {
  if (!invoice.invoice_items?.length) {
    return '';
  }
  const { invoice_items } = invoice;
  let materialsRows = '';
  for (const item of invoice_items) {
    if (item.type !== InvoiceItemType.materials) {
      continue;
    }
    materialsRows += `
      <tr>
        <td style="padding-bottom: 10px;">${item.description}</td>
        <td style="padding-bottom: 10px; text-align: right;">$${toMajorUnits(
          item.quantity * item.amount_in_minor_units,
        )}</td>
      </tr>
    `;
  }
  return materialsRows;
}

export function taxRows(invoice: Invoice) {
  if (!invoice.invoice_items?.length) {
    return '';
  }
  const { invoice_items } = invoice;
  let taxRows = '';
  for (const item of invoice_items) {
    if (item.type !== InvoiceItemType.tax) {
      continue;
    }
    taxRows += `
      <tr>
        <td style="padding-bottom: 10px;">${item.description}</td>
        <td style="padding-bottom: 10px; text-align: right;">$${toMajorUnits(
          item.amount_in_minor_units,
        )}</td>
      </tr>
    `;
  }
  return taxRows;
}

export function processingFeeRow(invoice: Invoice) {
  if (invoice.payment_method === InvoicePaymentMethod.cash) {
    return '';
  }
  return `
      <tr>
        <td style="padding-bottom: 10px;">Processing Fee</td>
        <td style="padding-bottom: 10px; text-align: right;">$${toMajorUnits(
          invoice.processing_fee,
        )}</td>
      </tr>
    `;
}

export function constructReceiptTableFromInvoice(invoice: Invoice) {
  let tableRows = '';
  tableRows += timeRows(invoice);
  tableRows += materialsRows(invoice);
  tableRows += taxRows(invoice);
  tableRows += processingFeeRow(invoice);
  tableRows += `
  <tr style="border-top: 2px solid #101042;">
    <td style="font-weight: 600; padding: 10px 0;">Total</td>
    <td style="font-weight: 600; padding: 10px 0; text-align: right;">$${toMajorUnits(
      invoice.total_to_be_charged,
    )}</td>
  </tr>`;
  return `<tbody>${tableRows}</tbody>`;
}

export async function sendReceipt(
  appointment: Appointment,
  service_provider_user: User,
  client_profile: ClientProfile,
  invoice: Invoice,
) {
  const appointment_date = format(
    new Date(appointment.datetime_local),
    'LLLL do',
  );
  const location = appointment.address_street + ', ' + appointment.address_city;
  let service_provider =
    service_provider_user.given_name + ' ' + service_provider_user.family_name;
  if (service_provider_user.contractor_profile?.company_name) {
    service_provider +=
      ' at ' + service_provider_user.contractor_profile.company_name;
  }
  const emailData = {
    to: client_profile.email,
    subject: `Receipt for ${appointment_date}`,
    html: constructEmail(invoiceReceiptTemplate, {
      appointment_date,
      service_provider,
      location,
      tableContents: constructReceiptTableFromInvoice(invoice),
    }),
    text: `Thanks for your business! Your total was $${toMajorUnits(
      invoice.total_to_be_charged,
    )}.`,
    // 'v:host': '',
    // 'v:token': resetPasswordRequest.verification_token,
  };
  await orderEmail(emailData);
}
