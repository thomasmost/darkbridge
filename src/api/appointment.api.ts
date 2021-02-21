import Koa from 'koa';
import Router from 'koa-router';
import { addMinutes, format } from 'date-fns';
import {
  Appointment,
  AppointmentCreationAttributes,
} from '../models/appointment.model';
import { getById } from './base.api';
import { TeddyRequestContext } from './types';
import {
  ClientProfile,
  ClientProfileAttributes,
} from '../models/client_profile.model';
import { Op } from 'sequelize';
import { ValidationError } from '../helpers/error.helper';

// import { WhereAttributeHash } from 'sequelize/types';
// import {
//   Appointment,
//   AppointmentAttributes,
// } from '../models/appointment.model';

export const appointmentAPI = new Router();

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function getDailyInfo(ctx: TeddyRequestContext) {
  if (!ctx.user) {
    ctx.status = 401;
    return;
  }
  const appointments = await Appointment.findAll({
    where: {
      service_provider_user_id: ctx.user.id,
      datetime_local: {
        [Op.gte]: new Date(),
      },
    },
    order: [['datetime_local', 'ASC']],
  });
  ctx.status = 200;

  const countAppointments = appointments.length;

  if (countAppointments === 0) {
    ctx.body = {
      appointments,
      nextAppointment: null,
      summary: `Looks like you don't have any appointments today. Time to kick back! (Alternatively, you can head over to your Calendar to add a new job)`,
    };
    return;
  }
  const lastAppointment = appointments[countAppointments - 1];
  const doneBy = format(new Date(lastAppointment.datetime_end_utc), 'h:mm a');
  let completed = 0;
  let nextAppointment = null;
  const client_profile_ids = appointments.map(
    (appointment) => appointment.client_profile_id,
  );
  const clientProfilesById: Record<string, ClientProfileAttributes> = {};

  const profiles = await ClientProfile.findAll({
    where: {
      id: client_profile_ids,
    },
  });
  for (const profile of profiles) {
    clientProfilesById[profile.id] = profile;
    console.log(JSON.stringify(profile));
  }

  console.log('boo!');
  console.log(JSON.stringify(clientProfilesById));

  const appointmentsWithProfiles = appointments.map((appointment) => {
    appointment.client_profile =
      clientProfilesById[appointment.client_profile_id];
    return appointment;
  });

  for (const appointment of appointmentsWithProfiles) {
    if (appointment.status === 'completed') {
      completed++;
    }
    if (appointment.status === 'scheduled' && nextAppointment === null) {
      nextAppointment = appointment;
    }
  }

  const noun = countAppointments === 1 ? 'appointment' : 'appointments';
  if (completed === 0) {
    ctx.body = {
      appointments: appointmentsWithProfiles,
      nextAppointment,
      summary: `Today you have ${countAppointments} ${noun}, within a 15 mile radius. You should be done by ${doneBy}.`,
    };
    return;
  }
  ctx.body = {
    appointments: appointmentsWithProfiles,
    nextAppointment,
    summary: `Today you have ${countAppointments} ${noun}, within a 15 mile radius. You've already knocked out ${completed}! You should be done by ${doneBy} this evening.`,
  };
}

appointmentAPI.get('/daily', getDailyInfo);

export async function getAppointments(ctx: Koa.ParameterizedContext) {
  ctx.body = [];
  ctx.status = 200;
}

appointmentAPI.get('/', getAppointments);

appointmentAPI.get('/:id', getById(Appointment));

export async function createAppointment(ctx: TeddyRequestContext) {
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

  const conflictingAppointments = await Appointment.findAll({
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

appointmentAPI.post('/', createAppointment);

export async function cancelAppointment(ctx: TeddyRequestContext) {
  if (!ctx.user) {
    ctx.status = 401;
    return;
  }
  const user = ctx.user;

  const id = ctx.params.id;
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

appointmentAPI.put('/:id/cancel', cancelAppointment);

export async function rateServiceOnAppointment(ctx: TeddyRequestContext) {
  const { rating } = ctx.request.body as { rating: number };

  const id = ctx.params.id;
  const appointment = await Appointment.findByPk(id);

  // If the appointment doesn't exist, 404
  if (!appointment) {
    ctx.status = 404;
    return;
  }
  if (appointment.rating_of_service) {
    throw Error('appointment service has already been rated');
  }
  appointment.rating_of_service = rating;
  await appointment.save();
  ctx.status = 204;
}

appointmentAPI.put('/:id/rate_service', rateServiceOnAppointment);

export async function rateClientOnAppointment(ctx: TeddyRequestContext) {
  if (!ctx.user) {
    ctx.status = 401;
    return;
  }
  const { rating } = ctx.request.body as { rating: number };
  const user = ctx.user;

  const id = ctx.params.id;
  const appointment = await Appointment.findByPk(id);

  // If either the appointment doesn't exist or doesn't belong to the logged in user, 404
  if (!appointment || appointment.service_provider_user_id !== user.id) {
    ctx.status = 404;
    return;
  }
  appointment.rating_of_client = rating;
  await appointment.save();
  ctx.status = 204;
}

appointmentAPI.put('/:id/rate_client', rateClientOnAppointment);
