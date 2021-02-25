import Koa from 'koa';
import { addMinutes } from 'date-fns';
import {
  Appointment,
  AppointmentCreationAttributes,
} from '../models/appointment.model';
import { getById } from './base.api';
import { TeddyRequestContext } from './types';
import { ClientProfile } from '../models/client_profile.model';
import { Op } from 'sequelize';
import { ValidationError } from '../helpers/error.helper';
import {
  request,
  summary,
  body,
  prefix,
  tags,
  path,
  description,
  responses,
} from '@callteddy/koa-swagger-decorator';

import { NotImplemented } from '../helpers/error.helper';

const AppointmentTag = tags(['appointments']);

const postBodyParams = {
  client_profile_id: {
    type: 'string',
    required: true,
    description: 'the id of the ClientProfile associated with this appointment',
  },
  datetime_local: {
    type: 'string',
    required: true,
    description: "the stringified datetime of the appointment's start",
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
export class AppointmentAPI {
  @AppointmentTag
  @request('post', '')
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
    } = ctx.request.body as AppointmentCreationAttributes;

    if (!duration_minutes) {
      throw Error('400');
    }

    const client_profile = await ClientProfile.findByPk(client_profile_id);
    if (!client_profile) {
      throw Error(`Client with id ${client_profile_id} not found`);
    }

    const datetime_end_local = addMinutes(
      new Date(datetime_local),
      duration_minutes,
    ).toString();

    const timezone = client_profile.timezone;

    const datetime_utc = new Date(datetime_local).toUTCString();
    const datetime_end_utc = new Date(datetime_end_local).toUTCString();

    const {
      address_street,
      address_city,
      address_state,
      address_postal_code,
    } = client_profile;

    const conflictingAppointments = await getConflictingAppointments(
      datetime_utc,
      datetime_end_utc,
    );

    if (conflictingAppointments.length) {
      throw new ValidationError('An existing appointment conflicts');
    }

    // for now, appointments can only be generated by the service providers
    const service_provider_user_id = ctx.user.id;

    const appointment = await Appointment.create({
      client_profile_id,
      datetime_local: datetime_local.substring(0, 24) + ' GMT',
      datetime_utc,
      datetime_end_local: datetime_end_local.substring(0, 24) + ' GMT',
      datetime_end_utc,
      service_provider_user_id,
      summary,
      address_street,
      address_city,
      address_state,
      address_postal_code,
      timezone,
      priority,
    });

    ctx.body = appointment;
    ctx.status = 200;
  }

  @AppointmentTag
  @request('get', '')
  @summary("query the logged in service provider's appointments")
  public static async getAppointments(ctx: Koa.ParameterizedContext) {
    throw new NotImplemented();
    // ctx.body = [];
    // ctx.status = 200;
  }

  @AppointmentTag
  @request('get', '/{id}')
  @summary('get a single appointment by primary key')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  public static async getAppointmentById(ctx: Koa.ParameterizedContext) {
    return getById(Appointment)(ctx);
    // ctx.body = [];
    // ctx.status = 200;
  }

  @AppointmentTag
  @request('put', '/{id}/cancel')
  @path({
    id: { type: 'string', required: true, description: 'id' },
  })
  @summary('cancel an appointment by the service provider')
  @summary(
    "For now, only service providers can cancel their appointments. We'll need to support client cancellations soon enough",
  )
  @responses({
    204: { description: 'Success' },
    404: { description: 'Not Found' },
  })
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
    appointment.status = 'canceled';
    await appointment.save();
    ctx.status = 204;
  }

  @AppointmentTag
  @request('put', '/{id}/rate_service')
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

  @AppointmentTag
  @request('put', '/{id}/rate_client')
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

export async function getConflictingAppointments(
  datetime_utc: string,
  datetime_end_utc: string,
) {
  return Appointment.findAll({
    where: {
      [Op.or]: [
        {
          datetime_utc: {
            [Op.gte]: datetime_utc,
            [Op.lte]: datetime_end_utc,
          },
        },
        {
          datetime_end_utc: {
            [Op.gte]: datetime_utc,
            [Op.lte]: datetime_end_utc,
          },
        },
      ],
    },
  });
}
