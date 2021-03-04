import Koa from 'koa';
import {
  Appointment,
  AppointmentModel,
  IAppointmentPostBody,
} from '../models/appointment.model';
import { getById } from './base.api';
import { TeddyRequestContext } from './types';
import { ClientProfile } from '../models/client_profile.model';
import { Op, WhereAttributeHash } from 'sequelize';
import {
  request,
  summary,
  body,
  prefix,
  path,
  description,
  responses,
  operation,
  securityAll,
  tagsAll,
  query,
} from '@callteddy/koa-swagger-decorator';

import { DateTimeHelper } from '../helpers/datetime.helper';
import { arrayOf, baseCodes } from '../helpers/swagger.helper';
import { createAppointmentForClient } from '../helpers/appointment.helper';
import { ValidationError } from '../helpers/error.helper';

const postBodyParams = {
  client_profile_id: {
    type: 'string',
    required: true,
    description: 'the id of the ClientProfile associated with this appointment',
  },
  datetime_local: {
    type: 'string',
    required: true,
    description:
      "a representation of the local time of the appointment, which must exactly match the following format: 'YYYY-MM-DD HH-MM-SS'",
    example: DateTimeHelper.formatToPureDateTime(new Date()),
  },
  duration_minutes: {
    type: 'number',
    required: true,
    description: 'the length of the appointment',
  },
  summary: {
    type: 'string',
    required: true,
    description: 'short description of the appointment',
  },
  priority: {
    type: 'string',
    required: true,
    description: 'The appointment priority, from P0 to P3',
  },
};
@prefix('/appointment')
@securityAll([{ token: [] }])
@tagsAll(['appointments'])
export class AppointmentAPI {
  @request('post', '')
  @operation('apiAppointment_create')
  @summary('create a new appointment for the logged in service provider')
  @body(postBodyParams)
  public static async createAppointment(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }

    const {
      client_profile_id,
      datetime_local,
      duration_minutes,
      priority,
      summary,
    } = ctx.request.body as IAppointmentPostBody;

    // for now, appointments can only be generated by the service providers
    const service_provider_user_id = ctx.user.id;

    ctx.body = await createAppointmentForClient(
      service_provider_user_id,
      client_profile_id,
      datetime_local,
      duration_minutes,
      priority,
      summary,
    );
    ctx.status = 200;
  }

  @request('get', '')
  @operation('apiAppointment_query')
  @summary("query the logged in service provider's appointments")
  @query({
    ids: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    before: {
      type: 'string',
    },
    after: {
      type: 'string',
    },
    beforeMs: {
      type: 'number',
    },
    afterMs: {
      type: 'number',
    },
  })
  @responses({
    200: {
      description: 'Success',
      schema: arrayOf(AppointmentModel),
    },
    ...baseCodes([400, 401]),
  })
  public static async getAppointments(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const { before, after, beforeMs, afterMs } = ctx.query;

    if ((before && beforeMs) || (after && afterMs)) {
      throw new ValidationError(
        "Can't query with both millisecond time and string dates",
      );
    }

    const where = constructAppointmentQueryWhere(ctx.user.id, ctx.query);
    const appointments = await Appointment.findAll({
      where,
      order: [['datetime_utc', 'ASC']],
    });

    const client_profile_ids = appointments.map(
      (appointment) => appointment.client_profile_id,
    );
    const client_profiles = await ClientProfile.findAll({
      where: {
        id: client_profile_ids,
      },
    });
    const client_profiles_by_id: Record<string, ClientProfile> = {};
    for (const profile of client_profiles) {
      client_profiles_by_id[profile.id] = profile;
    }
    for (const appointment of appointments) {
      appointment.client_profile =
        client_profiles_by_id[appointment.client_profile_id];
    }

    ctx.status = 200;
    ctx.body = appointments;
  }

  @request('get', '/{id}')
  @operation('apiAppointment_getById')
  @summary('get a single appointment by primary key')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  public static async getAppointmentById(ctx: Koa.ParameterizedContext) {
    return getById(Appointment)(ctx);
    // ctx.body = [];
    // ctx.status = 200;
  }

  @request('put', '/{id}/cancel')
  @operation('apiAppointment_cancel')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @summary('cancel an appointment by the service provider')
  @description(
    "For now, only service providers can cancel their appointments. We'll need to support client cancellations soon enough",
  )
  @responses(baseCodes([204, 401, 404, 405]))
  public static async cancelAppointment(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user = ctx.user;

    const { id } = ctx.validatedParams;
    const appointment = await Appointment.findByPk(id);

    // If either the appointment doesn't exist or doesn't belong to the logged in user, 404
    if (!appointment || appointment.service_provider_user_id !== user.id) {
      ctx.status = 404;
      return;
    }
    if (appointment.status !== 'scheduled') {
      ctx.status = 405;
      ctx.body = `Appointments in state ${appointment.status} are not allowed to be canceled`;
      return;
    }
    appointment.status = 'canceled';
    await appointment.save();
    ctx.status = 204;
  }

  @request('put', '/{id}/complete')
  @operation('apiAppointment_complete')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @summary('complete an appointment by the service provider')
  @description(
    'For now, only service providers can complete their appointments.',
  )
  @responses(baseCodes([204, 401, 404, 405]))
  public static async completeAppointment(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user = ctx.user;

    const { id } = ctx.validatedParams;
    const appointment = await Appointment.findByPk(id);

    // If either the appointment doesn't exist or doesn't belong to the logged in user, 404
    if (!appointment || appointment.service_provider_user_id !== user.id) {
      ctx.status = 404;
      return;
    }
    if (appointment.status !== 'scheduled') {
      ctx.status = 405;
      ctx.body = `Appointments in state ${appointment.status} are not allowed to be completed`;
      return;
    }
    const now = new Date();
    if (DateTimeHelper.isBefore(now, new Date(appointment.datetime_utc))) {
      ctx.status = 405;
      ctx.body = `Appointment cannot be marked completed before its start-time`;
      return;
    }
    appointment.status = 'completed';
    await appointment.save();
    ctx.status = 204;
  }

  @request('put', '/{id}/rate_service')
  @operation('apiAppointment_rateService')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @summary('rate the service on an appointment')
  @description(
    'This endpoint will be used by a client to rate their experience with the Teddy service provider. Currently, the action can only be performed once.',
  )
  @body({
    rating: {
      type: 'number',
      required: true,
      description: 'from 1 to 5',
    },
  })
  @responses({
    204: { description: 'Success' },
    404: { description: 'Not Found' },
    405: { description: 'Already rated' },
  })
  public static async rateServiceOnAppointment(ctx: TeddyRequestContext) {
    const { rating } = ctx.request.body as { rating: number };

    const { id } = ctx.validatedParams;
    const appointment = await Appointment.findByPk(id);

    // If the appointment doesn't exist, 404
    if (!appointment) {
      ctx.status = 404;
      return;
    }
    if (appointment.rating_of_service) {
      ctx.status = 405;
      ctx.body = 'Appointment service has already been rated';
    }
    appointment.rating_of_service = rating;
    await appointment.save();
    ctx.status = 204;
  }

  @request('put', '/{id}/rate_client')
  @operation('apiAppointment_rateClient')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @summary('rate the client on an appointment')
  @description(
    'This endpoint will be used by a Teddy service provider to rate their experience with the client. Currently, the action can only be performed once.',
  )
  @body({
    rating: {
      type: 'number',
      required: true,
      description: 'from 1 to 5',
    },
  })
  @responses({
    204: { description: 'Success' },
    404: { description: 'Not Found' },
    405: { description: 'Already rated' },
  })
  public static async rateClientOnAppointment(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user = ctx.user;
    const { rating } = ctx.request.body as { rating: number };

    const { id } = ctx.validatedParams;
    const appointment = await Appointment.findByPk(id);

    // If either the appointment doesn't exist or doesn't belong to the logged in user, 404
    if (!appointment || appointment.service_provider_user_id !== user.id) {
      ctx.status = 404;
      return;
    }
    if (appointment.rating_of_client) {
      ctx.status = 405;
      ctx.body = 'Appointment service has already been rated';
    }
    appointment.rating_of_client = rating;
    await appointment.save();
    ctx.status = 204;
  }
}

type AppointmentQueryParams = {
  ids?: string[];
  before?: string;
  after?: string;
  beforeMs?: string;
  afterMs?: string;
};

export const constructAppointmentQueryWhere = (
  service_provider_user_id: string,
  query: AppointmentQueryParams,
) => {
  const where: WhereAttributeHash = {
    service_provider_user_id,
  };
  const { ids, before, after, beforeMs, afterMs } = query;

  if (ids) {
    where.id = Array.isArray(ids) ? ids : [ids];
  }
  // note that these bounds are officially as generous as possible:
  // we use the end time for the earlier bound and the start time for the later bound
  if (before) {
    where.datetime_utc = {
      [Op.lte]: new Date(before),
    };
  }
  if (after) {
    where.datetime_end_utc = {
      [Op.lte]: new Date(after),
    };
  }
  if (beforeMs) {
    where.datetime_utc = {
      [Op.lte]: new Date(parseInt(beforeMs)),
    };
  }
  if (afterMs) {
    where.datetime_end_utc = {
      [Op.gte]: new Date(parseInt(afterMs)),
    };
  }
  return where;
};
