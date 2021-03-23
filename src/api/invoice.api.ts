import {
  body,
  request,
  summary,
  prefix,
  securityAll,
  tagsAll,
  responses,
  operation,
  path,
} from '@callteddy/koa-swagger-decorator';

import { TeddyRequestContext } from './types';
import { baseCodes, swaggerRefFromModel } from '../helpers/swagger.helper';
import { Invoice, InvoiceModel, InvoiceStatus } from '../models/invoice.model';
import { ValidationError } from '../helpers/error.helper';
import { loadAndAuthorizeAppointment } from '../helpers/appointment.helper';
import {
  InvoiceItem,
  InvoiceItemAttributes,
  InvoiceItemModel,
} from '../models/invoice_item.model';

const postParams = {
  appointment_id: {
    type: 'string',
    description: 'the id of the billed appointment',
  },
  flat_rate: {
    type: 'number',
    description:
      'a flat rate to be billed (should default to the value in their contractor profile)',
  },
  hourly_rate: {
    type: 'number',
    description:
      'the hourly rate billed for this invoice (should default to the value in their contractor profile)',
  },
  daily_rate: {
    type: 'number',
    description:
      'the daily rate billed for this invoice (should default to the value in their contractor profile)',
  },
  minutes_billed: {
    type: 'number',
    description:
      'the number of minutes to bill at the hourly rate (otherwise leave as 0)',
  },
  days_billed: {
    type: 'number',
    description:
      'the number of days to bill at the daily rate (otherwise leave as 0)',
  },
  currency_code: {
    type: 'string',
    enum: ['USD'],
    description: 'Should always be USD to start',
  },
  invoice_items: {
    type: 'array',
    items: swaggerRefFromModel(InvoiceItemModel),
  },
};

@prefix('/invoice')
@securityAll([{ token: [] }])
@tagsAll(['invoice'])
export class InvoiceAPI {
  @request('post', '')
  @operation('apiInvoice_create')
  @summary('create a new invoice')
  @body(postParams)
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(InvoiceModel),
    },
    401: {
      description: 'Unauthorized',
    },
  })
  public static async createInvoice(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user = ctx.user;
    const service_provider_user_id = user.id;
    const {
      appointment_id,
      flat_rate,
      hourly_rate,
      daily_rate,
      minutes_billed,
      days_billed,
      invoice_items,
      currency_code,
    } = ctx.request.body;

    if (currency_code !== 'USD') {
      throw new ValidationError('Only USD invoices currently supported');
    }
    if (minutes_billed && days_billed) {
      throw new ValidationError('Billing for both hours and days is invalid');
    }

    // For now users can only invoice their own appointments
    const appointment = await loadAndAuthorizeAppointment(appointment_id, user);

    const client_profile_id = appointment.client_profile_id;
    const status = InvoiceStatus.pending;

    // This is obviously a placeholder
    const processing_fee = 100;
    let total_from_line_items = 0;

    const unsaved_invoice = await Invoice.build({
      service_provider_user_id,
      client_profile_id,
      status,
      flat_rate,
      hourly_rate,
      daily_rate,
      minutes_billed,
      days_billed,
      currency_code,
      processing_fee,
      total_from_line_items,
    });

    const item_promises = [];
    for (const item of invoice_items as InvoiceItemAttributes[]) {
      const {
        amount_in_minor_units,
        currency_code,
        description,
        quantity,
        type,
        metadata,
      } = item;

      const invoice_id = unsaved_invoice.id;
      if (currency_code !== 'USD') {
        throw new ValidationError('Non-USD currencies not yet supported');
      }

      total_from_line_items += amount_in_minor_units * quantity;
      const item_promise = InvoiceItem.create({
        invoice_id,
        service_provider_user_id,
        client_profile_id,
        amount_in_minor_units,
        currency_code,
        description,
        quantity,
        type,
        metadata,
      });
      item_promises.push(item_promise);
    }
    unsaved_invoice.total_from_line_items = total_from_line_items;
    const invoice = await unsaved_invoice.save();
    const items = await Promise.all(item_promises);
    await appointment.update({ invoice_id: invoice.id });
    invoice.invoice_items = items;
    ctx.status = 200;
    ctx.body = invoice;
  }

  @request('get', '/{id}')
  @operation('apiInvoice_getById')
  @summary('get a single invoice by primary key')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(InvoiceModel),
    },
    ...baseCodes([401, 404]),
  })
  public static async getInvoiceById(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const { id } = ctx.validatedParams;
    const invoicePromise = Invoice.findByPk(id);
    const itemPromise = InvoiceItem.findAll({
      where: {
        invoice_id: id,
      },
    });
    const [invoice, items] = await Promise.all([invoicePromise, itemPromise]);

    if (!invoice || invoice.service_provider_user_id !== ctx.user.id) {
      ctx.body = null;
      ctx.status = 404;
      return;
    }
    invoice.invoice_items = items;
    ctx.body = invoice;
  }
}
