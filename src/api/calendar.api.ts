import { format, startOfDay } from 'date-fns';
import { Appointment, AppointmentModel } from '../models/appointment.model';
import { TeddyRequestContext } from './types';
import {
  ClientProfile,
  ClientProfileAttributes,
} from '../models/client_profile.model';
import { Op } from 'sequelize';
import {
  request,
  summary,
  prefix,
  tagsAll,
  responses,
} from '@callteddy/koa-swagger-decorator';
import { sequelizeModelToSwaggerSchema } from '../helpers/swagger.helper';

@prefix('/calendar')
@tagsAll(['calendar'])
export class CalendarAPI {
  @request('get', '/daily')
  @summary(
    "get the day's appointments, the next appointment, and a summary of the user's day so far",
  )
  @responses({
    200: {
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          appointments: {
            type: 'array',
            items: sequelizeModelToSwaggerSchema(AppointmentModel),
          },
          nextAppointment: sequelizeModelToSwaggerSchema(AppointmentModel),
          summary: {
            type: 'string',
            example: `Looks like you don't have any appointments today. Time to kick back! (Alternatively, you can head over to your Calendar to add a new job)`,
          },
        },
      },
    },
  })
  public static async getDailyInfo(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    ctx.body = await assembleDailyInfo(ctx.user.id);
  }
}

export const assembleDailyInfo = async (user_id: string) => {
  const appointments = await Appointment.findAll({
    where: {
      service_provider_user_id: user_id,
      datetime_utc: {
        [Op.gte]: startOfDay(new Date()),
      },
    },
    order: [['datetime_utc', 'ASC']],
  });

  const client_profile_ids = appointments.map(
    (appointment) => appointment.client_profile_id,
  );

  let profiles: ClientProfile[] = [];
  if (client_profile_ids.length) {
    profiles = await ClientProfile.findAll({
      where: {
        id: client_profile_ids,
      },
    });
  }

  const clientProfilesById: Record<string, ClientProfileAttributes> = {};

  for (const profile of profiles) {
    clientProfilesById[profile.id] = profile;
    console.log(JSON.stringify(profile));
  }

  return dailyInfoFromData(appointments, clientProfilesById);
};

const dailyInfoFromData = (
  appointments: Appointment[],
  clientProfilesById: Record<string, ClientProfileAttributes>,
) => {
  const countAppointments = appointments.length;

  if (countAppointments === 0) {
    return {
      appointments,
      nextAppointment: null,
      summary: `Looks like you don't have any appointments today. Time to kick back! (Alternatively, you can head over to your Calendar to add a new job)`,
    };
  }
  const lastAppointment = appointments[countAppointments - 1];
  const doneBy = format(new Date(lastAppointment.datetime_end_utc), 'h:mm a');

  let completed = 0;
  let nextAppointment = null;

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
    return {
      appointments: appointmentsWithProfiles,
      nextAppointment,
      summary: `Today you have ${countAppointments} ${noun}, within a 15 mile radius. You should be done by ${doneBy}.`,
    };
  }
  return {
    appointments: appointmentsWithProfiles,
    nextAppointment,
    summary: `Today you have ${countAppointments} ${noun}, within a 15 mile radius. You've already knocked out ${completed}! You should be done by ${doneBy} this evening.`,
  };
};
