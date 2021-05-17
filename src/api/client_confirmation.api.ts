import {
  AuthenticatedRequestContext,
  SemiAuthenticatedRequestContext,
} from './types';
import {
  body,
  request,
  summary,
  prefix,
  tagsAll,
  responses,
  operation,
  path,
} from '@callteddy/koa-swagger-decorator';
import { ClientConfirmationRequest } from '../models/client_confirmation_request.model';
import { BadRequestError, NotFoundError } from '../helpers/error.helper';
import { Appointment, AppointmentModel } from '../models/appointment.model';
import {
  baseCodes,
  swaggerRefFromDefinitionName,
  swaggerRefFromModel,
} from '../helpers/swagger.helper';
import { AppointmentStatus } from '../shared/enums';
import { kirk } from '../helpers/log.helper';
import { issueClientConfirmationRequest } from '../helpers/client_confirmation_request.helper';
import { User } from '../models/user.model';
import {
  ClientProfile,
  ClientProfileModel,
} from '../models/client_profile.model';
import { StripeHelper } from '../helpers/stripe.helper';
import Stripe from 'stripe';

const SESSION_NO_LONGER_VALID = 'This session is no longer valid';

@prefix('/client_confirmation')
@tagsAll(['clientConfirmation'])
export class ClientConfirmationAPI {
  @request('post', '/request_new')
  @operation('apiClientConfirmation_requestNewToken')
  @summary('request a refreshed token sent to the original email address')
  @body({
    token: {
      type: 'string',
      required: true,
      description: 'the original client profile request',
    },
  })
  @responses({
    204: {
      description: 'Success',
    },
    ...baseCodes([400, 404]),
  })
  public static async requestNewToken(ctx: SemiAuthenticatedRequestContext) {
    const { token } = ctx.request.body;
    const confirmation_request = await ClientConfirmationRequest.findByPk(
      token,
    );

    if (!confirmation_request) {
      throw new NotFoundError();
    }

    if (
      !confirmation_request.fulfilled_at &&
      confirmation_request.created_at > Date.now() - 8 * 60 * 60 * 1000
    ) {
      throw new BadRequestError(
        `Can't request a new token based on a valid one`,
      );
    }

    const appointment = await Appointment.findByPk(
      confirmation_request.appointment_id,
    );

    if (!appointment) {
      throw new NotFoundError();
    }
    const { service_provider_user_id } = appointment;

    const user = await User.findByPk(service_provider_user_id);
    if (!user) {
      const appointment_id = appointment.id;
      kirk.error(`Can't find user for appointment`, {
        appointment_id,
        service_provider_user_id,
      });
      throw new Error(`Can't find uesr`);
    }

    issueClientConfirmationRequest(
      user,
      confirmation_request.client_profile_id,
      appointment.id,
    );

    ctx.status = 204;
  }

  @request('post', '/setup_intent')
  @operation('apiClientConfirmation_createSetupIntent')
  @summary(
    'creates a setup intent with stripe and returns a sensitive client_secret',
  )
  @body({
    token: {
      type: 'string',
      required: true,
      description: 'client confirmation token to set up',
    },
  })
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromDefinitionName('StripeClientSecretResponse'),
    },
    ...baseCodes([400, 401, 404]),
  })
  public static async createSetupIntent(ctx: AuthenticatedRequestContext) {
    const { token } = ctx.request.body;
    const confirmation_request = await authenticateClientConfirmationToken(
      token,
    );

    const { client_profile_id } = confirmation_request;

    const setupIntent = await StripeHelper.getCustomerPaymentSetupIntent(
      client_profile_id,
    );
    const { client_secret } = setupIntent;
    ctx.body = {
      client_secret,
    };
  }

  @request('post', '/add_payment_method')
  @operation('apiClientConfirmation_addPaymentMethod')
  @summary('add a payment method to a client')
  @body({
    token: {
      type: 'string',
      required: true,
      description: 'the token',
    },
    setupIntent: swaggerRefFromDefinitionName('SuccessfulStripeSetupIntent'),
  })
  @responses({
    ...baseCodes([204, 401]),
  })
  public static async addPaymentMethod(ctx: AuthenticatedRequestContext) {
    const { token, setupIntent } = ctx.request.body as {
      token: string;
      setupIntent: Stripe.SetupIntent;
    };

    const confirmation_request = await authenticateClientConfirmationToken(
      token,
    );
    const { client_profile_id, appointment_id } = confirmation_request;

    await StripeHelper.addPrimaryPaymentMethod(client_profile_id, setupIntent);
    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) throw Error();
    await appointment.update({ client_confirmed: true });
    confirmation_request.fulfilled_at = Date.now();
    confirmation_request.fulfilled_with = 'confirmed_with_payment_details';
    await confirmation_request.save();
    ctx.status = 204;
  }

  @request('get', '/confirm/{token}')
  @operation('apiClientConfirmation_confirmAppointment')
  @summary('add a payment method to a client')
  @path({
    token: { type: 'string', required: true, description: 'token' },
  })
  @responses({
    ...baseCodes([204, 401, 404]),
  })
  public static async confirmAppointment(ctx: AuthenticatedRequestContext) {
    const { token } = ctx.validatedParams as { token: string };

    const confirmation_request = await authenticateClientConfirmationToken(
      token,
    );
    const { appointment_id } = confirmation_request;

    const appointment = await Appointment.findByPk(appointment_id);
    if (!appointment) throw Error();
    await appointment.update({ client_confirmed: true });
    confirmation_request.fulfilled_at = Date.now();
    confirmation_request.fulfilled_with = 'confirmed_without_payment_details';
    await confirmation_request.save();
    ctx.redirect(`/e/client_portal/confirmed`);
  }

  @request('get', '/profile/{token}')
  @operation('apiClientCConfirmation_getProfile')
  @summary('get a single client profile for the token')
  @path({
    token: { type: 'string', required: true, description: 'token' },
  })
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(ClientProfileModel),
    },
    ...baseCodes([401, 404]),
  })
  public static async getClientById(ctx: AuthenticatedRequestContext) {
    const { token } = ctx.validatedParams;
    kirk.info('apiClientCConfirmation_getProfile', {
      token,
    });
    const confirmation_request = await authenticateClientConfirmationToken(
      token,
    );
    const client = await ClientProfile.findByPk(
      confirmation_request.client_profile_id,
    );
    ctx.body = client;
  }
  @request('get', '/appointment/{token}')
  @operation('apiClientConfirmation_getAppointment')
  @summary(
    'get the relevant appointment with a temporary client confirmation request',
  )
  @path({
    token: { type: 'string', required: true, description: 'token' },
  })
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(AppointmentModel),
    },
    ...baseCodes([400]),
  })
  public static async getAppointment(ctx: SemiAuthenticatedRequestContext) {
    const { token } = ctx.validatedParams;
    kirk.info('Getting an appointment for client confirmation', {
      token,
    });
    const confirmation_request = await authenticateClientConfirmationToken(
      token,
    );

    const appointment = await Appointment.findByPk(
      confirmation_request.appointment_id,
    );

    ctx.body = appointment;
    ctx.status = 200;
  }

  @request('put', '/cancel')
  @operation('apiClientConfirmation_cancelAppointment')
  @summary('cancel an appointment through the secured client portal')
  @body({
    token: {
      type: 'string',
      required: true,
      description: 'the client profile request',
    },
  })
  @responses({
    204: {
      description: 'Success',
    },
    ...baseCodes([400, 404]),
  })
  public static async cancelAppointment(ctx: SemiAuthenticatedRequestContext) {
    const { token } = ctx.request.body;
    const confirmation_request = await authenticateClientConfirmationToken(
      token,
    );

    const appointment = await Appointment.findByPk(
      confirmation_request.appointment_id,
    );

    if (!appointment) {
      throw new NotFoundError();
    }

    appointment.status = AppointmentStatus.canceled;
    confirmation_request.fulfilled_at = Date.now();
    confirmation_request.fulfilled_with = 'cancellation';
    await Promise.all([appointment.save(), confirmation_request.save()]);
    ctx.status = 204;
  }
}

const authenticateClientConfirmationToken = async (token: string) => {
  const confirmation_request = await ClientConfirmationRequest.findByPk(token);

  if (!confirmation_request) {
    throw new NotFoundError();
  }

  if (
    confirmation_request.fulfilled_at ||
    confirmation_request.created_at <= Date.now() - 8 * 60 * 60 * 1000
  ) {
    throw new BadRequestError(SESSION_NO_LONGER_VALID);
  }

  return confirmation_request;
};
