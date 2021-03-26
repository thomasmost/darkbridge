import {
  Appointment,
  AppointmentModel,
  IAppointmentPostBody,
} from '../models/appointment.model';
import { getById } from './base.api';
import { AuthenticatedRequestContext } from './types';
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
  middlewaresAll,
} from '@callteddy/koa-swagger-decorator';

import { DateTimeHelper } from '../helpers/datetime.helper';
import {
  arrayOf,
  baseCodes,
  swaggerRefFromModel,
} from '../helpers/swagger.helper';
import {
  createAppointmentForClient,
  loadAndAuthorizeAppointment,
  rescheduleAppointment,
  validateAppointmentStatusChange,
} from '../helpers/appointment.helper';
import { ValidationError } from '../helpers/error.helper';
import { AppointmentActivity } from '../models/appointment_activity.model';
import { AppointmentStatus } from '../shared/enums';
import { authUser } from './middlewares';

const postBodyParams = {
  override_warnings: {
    type: 'boolean',
    required: false,
    description:
      'set to true to override logical warnings and create the appointment regardless',
  },
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
    type: 'integer',
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
@middlewaresAll(authUser)
@tagsAll(['appointments'])
export class AppointmentAPI {
  @request('post', '')
  @operation('apiAppointment_create')
  @summary('create a new appointment for the logged in service provider')
  @body(postBodyParams)
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(AppointmentModel),
    },
    ...baseCodes([401, 405, 409]),
  })
  public static async createAppointment(ctx: AuthenticatedRequestContext) {
    const {
      override_warnings,
      client_profile_id,
      datetime_local,
      duration_minutes,
      priority,
      summary,
    } = ctx.request.body as IAppointmentPostBody;

    // for now, appointments can only be generated by the service providers
    const service_provider_user_id = ctx.user.id;

    ctx.body = await createAppointmentForClient(
      override_warnings,
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
      type: 'integer',
    },
    afterMs: {
      type: 'integer',
    },
  })
  @responses({
    200: {
      description: 'Success',
      schema: arrayOf(AppointmentModel),
    },
    ...baseCodes([400, 401]),
  })
  public static async getAppointments(ctx: AuthenticatedRequestContext) {
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
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(AppointmentModel),
    },
    ...baseCodes([401, 404]),
  })
  public static async getAppointmentById(ctx: AuthenticatedRequestContext) {
    await getById(Appointment)(ctx);
    if (ctx.body.service_provider_user_id !== ctx.user.id) {
      ctx.body = null;
      ctx.status = 404;
    }
  }

  @request('put', '/{id}/start')
  @operation('apiAppointment_start')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @body({
    cause: {
      type: 'string',
      enum: ['geofence_arrival', 'manual'],
      required: true,
      description:
        'indicate whether the appointment was auto-started or manually started',
    },
  })
  @summary('start an appointment')
  @description('For now, only service providers can start their appointments.')
  @responses(baseCodes([204, 401, 404, 405]))
  public static async startAppointment(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;

    const { id } = ctx.validatedParams;
    const appointment = await loadAndAuthorizeAppointment(id, user);

    validateAppointmentStatusChange(appointment, AppointmentStatus.in_progress);
    appointment.status = AppointmentStatus.in_progress;
    appointment.started_at = Date.now();
    await appointment.save();
    await AppointmentActivity.create({
      appointment_id: id,
      acting_user_id: user.id,
      action: 'started',
      note: ctx.request.body.cause,
    });
    ctx.status = 204;
  }

  @request('put', '/{id}/reschedule')
  @operation('apiAppointment_reschedule')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @body({
    datetime_local: {
      type: 'string',
      required: true,
      description:
        "a representation of the local time of the appointment, which must exactly match the following format: 'YYYY-MM-DD HH-MM-SS'",
      example: DateTimeHelper.formatToPureDateTime(new Date()),
    },
    duration_minutes: {
      type: 'integer',
      required: true,
      description: 'the length of the appointment',
    },
    reason_for_reschedule: {
      type: 'string',
      description: 'optional explanation for the reschedule',
    },
  })
  @summary('reschedule an appointment by the service provider')
  @description(
    "For now, only service providers can reschedule their appointments. We'll need to support client requests soon enough",
  )
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromModel(AppointmentModel),
    },
    ...baseCodes([401, 404, 405]),
  })
  public static async rescheduleAppointment(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;

    const { id } = ctx.validatedParams;
    const {
      datetime_local,
      duration_minutes,
      reason_for_reschedule,
    } = ctx.request.body;
    const appointment = await loadAndAuthorizeAppointment(id, user);
    const updatedAppointment = await rescheduleAppointment(
      appointment,
      datetime_local,
      duration_minutes,
      user.id,
      reason_for_reschedule,
    );
    ctx.status = 200;
    ctx.body = updatedAppointment;
  }

  @request('put', '/{id}/cancel')
  @operation('apiAppointment_cancel')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @body({
    cancelation_reason: {
      type: 'string',
      required: true,
      description: 'free text explaining the cancelation',
    },
  })
  @summary('cancel an appointment by the service provider')
  @description(
    "For now, only service providers can cancel their appointments. We'll need to support client cancellations soon enough",
  )
  @responses(baseCodes([204, 401, 404, 405]))
  public static async cancelAppointment(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;

    const { id } = ctx.validatedParams;
    const { cancelation_reason } = ctx.request.body;
    const appointment = await loadAndAuthorizeAppointment(id, user);

    validateAppointmentStatusChange(appointment, AppointmentStatus.canceled);
    appointment.status = AppointmentStatus.canceled;
    await appointment.save();
    await AppointmentActivity.create({
      appointment_id: id,
      acting_user_id: user.id,
      action: 'canceled',
      note: cancelation_reason,
    });
    ctx.status = 204;
  }

  @request('put', '/{id}/complete')
  @operation('apiAppointment_complete')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @body({
    notes: {
      type: 'string',
      description: 'any notes taken during the appointment',
    },
    followup_needed: {
      type: 'boolean',
      description: 'true if another appointment must be scheduled',
    },
  })
  @summary('complete an appointment by the service provider')
  @description(
    'For now, only service providers can complete their appointments.',
  )
  @responses(baseCodes([204, 401, 404, 405]))
  public static async completeAppointment(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;

    const { followup_needed, notes } = ctx.request.body;

    const { id } = ctx.validatedParams;
    const appointment = await loadAndAuthorizeAppointment(id, user);

    validateAppointmentStatusChange(appointment, AppointmentStatus.completed);
    appointment.status = AppointmentStatus.completed;
    appointment.completed_at = Date.now();
    appointment.requires_followup = followup_needed;
    appointment.notes = notes;
    await appointment.save();
    await AppointmentActivity.create({
      appointment_id: id,
      acting_user_id: user.id,
      action: 'completed',
      note: followup_needed ? 'requires followup' : '',
    });
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
      type: 'integer',
      required: true,
      description: 'from 1 to 5',
    },
  })
  @responses({
    204: { description: 'Success' },
    404: { description: 'Not Found' },
    405: { description: 'Already rated' },
  })
  public static async rateServiceOnAppointment(
    ctx: AuthenticatedRequestContext,
  ) {
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
      type: 'integer',
      required: true,
      description: 'from 1 to 5',
    },
  })
  @responses({
    204: { description: 'Success' },
    404: { description: 'Not Found' },
    405: { description: 'Already rated' },
  })
  public static async rateClientOnAppointment(
    ctx: AuthenticatedRequestContext,
  ) {
    const user = ctx.user;
    const { rating } = ctx.request.body as { rating: number };

    const { id } = ctx.validatedParams;
    const appointment = await loadAndAuthorizeAppointment(id, user);

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
