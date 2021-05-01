import {
  AuthenticatedRequestContext,
  SemiAuthenticatedRequestContext,
} from './types';
import {
  body,
  request,
  summary,
  prefix,
  securityAll,
  tagsAll,
  responses,
  operation,
  middlewaresAll,
  path,
} from '@callteddy/koa-swagger-decorator';
import {
  ContractorProfile,
  ContractorProfileUpdateAttributes,
} from '../models/contractor_profile.model';
import { authUser } from './middlewares';
import { ClientConfirmationRequest } from '../models/client_confirmation_request.model';
import { BadRequestError, NotFoundError } from '../helpers/error.helper';
import { Appointment, AppointmentModel } from '../models/appointment.model';
import { baseCodes, swaggerRefFromModel } from '../helpers/swagger.helper';
import { AppointmentStatus } from '../shared/enums';
import { kirk } from '../helpers/log.helper';
import { issueClientConfirmationRequest } from '../helpers/client_confirmation_request.helper';
import { User } from '../models/user.model';

type BodyParameter = {
  type: 'string' | 'integer' | 'boolean';
  description: string;
};

@prefix('/client_confirmation')
@tagsAll(['clientConfirmation'])
export class ClientConfirmationAPI {
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
    const confirmation_request = await ClientConfirmationRequest.findByPk(
      token,
    );

    if (!confirmation_request) {
      throw new NotFoundError();
    }

    if (
      confirmation_request.fulfilled_at ||
      confirmation_request.created_at <= Date.now() - 8 * 60 * 60 * 1000
    ) {
      throw new BadRequestError('This session is no longer valid');
    }

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
    const confirmation_request = await ClientConfirmationRequest.findByPk(
      token,
    );

    if (!confirmation_request) {
      throw new NotFoundError();
    }

    if (
      confirmation_request.fulfilled_at ||
      confirmation_request.created_at <= Date.now() - 8 * 60 * 60 * 1000
    ) {
      throw new BadRequestError('This session is no longer valid');
    }

    const appointment = await Appointment.findByPk(
      confirmation_request.appointment_id,
    );

    if (!appointment) {
      throw new NotFoundError();
    }

    appointment.status = AppointmentStatus.canceled;
    confirmation_request.fulfilled_at = Date.now();
    await Promise.all([appointment.save(), confirmation_request.save()]);
    ctx.status = 204;
  }

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
}
