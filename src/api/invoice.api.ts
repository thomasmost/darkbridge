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
  // middlewaresAll,
} from '@callteddy/koa-swagger-decorator';

import { AuthenticatedRequestContext } from './types';
import { baseCodes, swaggerRefFromModel } from '../helpers/swagger.helper';
import { Invoice, InvoiceModel } from '../models/invoice.model';
import {
  AuthenticationError,
  LogicalError,
  BadRequestError,
} from '../helpers/error.helper';
import { loadAndAuthorizeAppointment } from '../helpers/appointment.helper';
import {
  InvoiceItem,
  InvoiceItemAttributes,
  InvoiceItemModel,
} from '../models/invoice_item.model';
import {
  totalToBePaidOut,
  validateInvoice,
  validateInvoiceItem,
} from '../helpers/invoice.helper';
// import { authUser } from './middlewares';
import { InvoicePaymentMethod, InvoiceStatus } from '../shared/enums';
import { StripeHelper } from '../helpers/stripe.helper';
import { ClientProfile } from '../models/client_profile.model';
import { User } from '../models/user.model';
import Stripe from 'stripe';
import { kirk } from '../helpers/log.helper';

const postParams = {
  appointment_id: {
    type: 'string',
    required: true,
    description: 'the id of the billed appointment',
  },
  flat_rate: {
    type: 'integer',
    description:
      'a flat rate to be billed (should default to the value in their contractor profile)',
  },
  hourly_rate: {
    type: 'integer',
    description:
      'the hourly rate billed for this invoice (should default to the value in their contractor profile)',
  },
  daily_rate: {
    type: 'integer',
    description:
      'the daily rate billed for this invoice (should default to the value in their contractor profile)',
  },
  minutes_billed: {
    type: 'integer',
    description:
      'the number of minutes to bill at the hourly rate (otherwise leave as 0)',
  },
  days_billed: {
    type: 'integer',
    description:
      'the number of days to bill at the daily rate (otherwise leave as 0)',
  },
  payment_method: {
    type: 'string',
    required: true,
    enum: Object.values(InvoicePaymentMethod),
    description: 'method of payment',
  },
  currency_code: {
    type: 'string',
    required: true,
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
// @middlewaresAll(authUser)
@tagsAll(['invoice'])
export class InvoiceAPI {
  // eslint-disable-next-line max-lines-per-function
  @request('post', '')
  @operation('apiInvoice_create')
  @summary('create a new invoice')
  @body(postParams)
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(InvoiceModel),
    },
    ...baseCodes([401, 405]),
  })
  public static async createInvoice(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;
    if (!ctx.user) {
      throw new AuthenticationError(
        'Only logged in users may access the invoice api',
      );
    }
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
      payment_method,
    } = ctx.request.body;

    if (currency_code !== 'USD') {
      throw new BadRequestError('Only USD invoices currently supported');
    }
    if (minutes_billed && days_billed) {
      throw new BadRequestError('Billing for both hours and days is invalid');
    }

    // For now users can only invoice their own appointments
    const appointment = await loadAndAuthorizeAppointment(appointment_id, user);
    if (appointment.invoice_id) {
      throw new LogicalError('This appointment has already been invoiced');
    }
    const client_profile_id = appointment.client_profile_id;
    const status =
      payment_method === 'cash' ? InvoiceStatus.paid : InvoiceStatus.pending;

    // These will be filled in later
    const processing_fee = 0;
    const total_from_line_items = 0;

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
      payment_method,
      processing_fee,
      total_from_line_items,
    });

    validateInvoice(unsaved_invoice);

    const { sumTotalFromLineItems, unsaved_items } = processLineItems(
      unsaved_invoice,
      invoice_items,
    );

    unsaved_invoice.total_from_line_items = sumTotalFromLineItems;
    if (payment_method !== 'cash') {
      unsaved_invoice.processing_fee = Math.ceil(
        totalToBePaidOut(unsaved_invoice) * 0.04,
      );
    }
    const invoice = await unsaved_invoice.save();
    const itemPromises = unsaved_items.map((item) => item.save());
    const items = await Promise.all(itemPromises);
    await appointment.update({ invoice_id: invoice.id });
    const client_profile = await ClientProfile.findByPk(client_profile_id);
    if (!client_profile) {
      throw Error('This should never happen');
    }
    invoice.client_secret = await handleAutomaticPayment(
      invoice,
      user,
      client_profile,
    );
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
  public static async getInvoiceById(ctx: AuthenticatedRequestContext) {
    if (!ctx.user) {
      throw new AuthenticationError(
        'Only logged in users may access the invoice api',
      );
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

function processLineItems(
  unsaved_invoice: Invoice,
  invoice_items: InvoiceItemAttributes[],
) {
  const unsaved_items = [];
  let sumTotalFromLineItems = 0;
  for (const item of invoice_items || []) {
    validateInvoiceItem(item);
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
      throw new BadRequestError('Non-USD currencies not yet supported');
    }

    const { client_profile_id, service_provider_user_id } = unsaved_invoice;

    sumTotalFromLineItems += amount_in_minor_units * quantity;
    const unsaved_item = InvoiceItem.build({
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
    unsaved_items.push(unsaved_item);
  }
  return { unsaved_items, sumTotalFromLineItems };
}

async function handleAutomaticPayment(
  invoice: Invoice,
  user: User,
  client_profile: ClientProfile,
) {
  const { stripe_customer_id, primary_payment_method_id } = client_profile;
  if (stripe_customer_id && primary_payment_method_id) {
    const promise = StripeHelper.chargeExistingPaymentMethod(
      stripe_customer_id,
      primary_payment_method_id,
      user.stripe_express_account_id,
      invoice.total_to_be_charged,
      invoice.processing_fee,
      'usd',
    );
    return handlePaymentIntentPromise(invoice, promise);
  } else if (stripe_customer_id) {
    const promise = StripeHelper.createPendingCharge(
      stripe_customer_id,
      user.stripe_express_account_id,
      invoice.total_to_be_charged,
      invoice.processing_fee,
      'usd',
    );
    return handlePaymentIntentPromise(invoice, promise);
  }
  return null;
}

async function handlePaymentIntentPromise(
  invoice: Invoice,
  payment_intent_promise: Promise<
    | {
        paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
        error?: undefined;
      }
    | {
        paymentIntent: undefined;
        error: Error;
      }
  >,
) {
  const res = await payment_intent_promise;
  if (res.error) {
    kirk.error('Failed to create a charge');
    return null;
  } else {
    const { paymentIntent } = res;
    if (!paymentIntent) {
      throw Error('payment intent undefined?');
    }
    const stripe_payment_intent_id = paymentIntent.id;
    if (paymentIntent.status === 'succeeded') {
      await invoice.update({ status: 'paid', stripe_payment_intent_id });
    } else {
      await invoice.update({ stripe_payment_intent_id });
    }

    const { client_secret } = paymentIntent;
    return client_secret;
  }
}
