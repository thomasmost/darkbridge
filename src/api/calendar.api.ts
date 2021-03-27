import { endOfDay, format, startOfDay } from 'date-fns';
import { Appointment } from '../models/appointment.model';
import { AuthenticatedRequestContext } from './types';
import {
  ClientProfile,
  ClientProfileAttributes,
} from '../models/client_profile.model';
import { Op } from 'sequelize';
import {
  middlewaresAll,
  operation,
  prefix,
  request,
  responses,
  securityAll,
  summary,
  tagsAll,
} from '@callteddy/koa-swagger-decorator';
import { swaggerRefFromDefinitionName } from '../helpers/swagger.helper';
import { authUser } from './middlewares';

@prefix('/calendar')
@securityAll([{ token: [] }])
@middlewaresAll(authUser)
@tagsAll(['calendar'])
export class CalendarAPI {
  @request('get', '/daily')
  @operation('apiCalendar_getDailyInfo')
  @summary(
    "get the day's appointments, the next appointment, and a summary of the user's day so far",
  )
  @responses({
    200: {
      description: 'Success',
      schema: swaggerRefFromDefinitionName('DailyInfo'),
    },
    401: {
      description: 'Unauthorized',
    },
  })
  public static async getDailyInfo(ctx: AuthenticatedRequestContext) {
    ctx.body = await assembleDailyInfo(ctx.user.id);
  }
}

export const assembleDailyInfo = async (user_id: string) => {
  const today = new Date();
  const appointments = await Appointment.findAll({
    where: {
      service_provider_user_id: user_id,
      datetime_utc: {
        [Op.gte]: startOfDay(today),
        [Op.lte]: endOfDay(today),
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
      summary: `Looks like you don't have any appointments today. Time to kick back (or head over to your Calendar to add a new job)!`,
    };
  }
  const lastAppointment = appointments[countAppointments - 1];
  const doneBy = format(new Date(lastAppointment.datetime_end_utc), 'h:mm a');

  const appointmentsWithProfiles = appointments.map((appointment) => {
    appointment.client_profile =
      clientProfilesById[appointment.client_profile_id];
    return appointment;
  });

  const {
    countCompleted,
    currentAppointment,
    nextAppointment,
  } = breakdownFromSortedListOfAppointments(appointmentsWithProfiles);

  const noun = countAppointments === 1 ? 'appointment' : 'appointments';
  if (countCompleted === 0) {
    return {
      appointments: appointmentsWithProfiles,
      nextAppointment,
      currentAppointment,
      summary: `Today you have ${countAppointments} ${noun}, within a 15 mile radius. You should be done by ${doneBy}.`,
    };
  }
  if (countCompleted === countAppointments) {
    return {
      appointments: appointmentsWithProfiles,
      nextAppointment,
      currentAppointment,
      summary: `Today you had ${countAppointments} ${noun}, but it looks like you're all done!`,
    };
  }
  return {
    appointments: appointmentsWithProfiles,
    nextAppointment,
    currentAppointment,
    summary: `Today you have ${countAppointments} ${noun}, within a 15 mile radius. You've already knocked out ${countCompleted}! You should be done by ${doneBy} this evening.`,
  };
};

const breakdownFromSortedListOfAppointments = (appointments: Appointment[]) => {
  let countCompleted = 0;
  let nextAppointment = null;
  let currentAppointment = null;

  for (const appointment of appointments) {
    if (appointment.status === 'completed') {
      countCompleted++;
    }
    if (appointment.status === 'scheduled' && !nextAppointment) {
      nextAppointment = appointment;
    }
    if (appointment.status === 'in_progress') {
      currentAppointment = appointment;
    }
  }
  return { countCompleted, currentAppointment, nextAppointment };
};
