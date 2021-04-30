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
    401: {
      description: 'Unauthorized',
    },
  })
  // eslint-disable-next-line sonarjs/cognitive-complexity
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
}
