import { format, startOfDay } from 'date-fns';
import { Appointment } from '../models/appointment.model';
import { TeddyRequestContext } from './types';
import {
  ClientProfile,
  ClientProfileAttributes,
} from '../models/client_profile.model';
import { Op } from 'sequelize';
import { request, summary, prefix, tags } from 'koa-swagger-decorator';

const CalendarTag = tags(['calendar']);

@prefix('/calendar')
export class CalendarAPI {
  @CalendarTag
  @request('get', '/daily')
  @summary(
    "get the day's appointments, the next appointment, and a summary of the user's day so far",
  )
  // eslint-disable-next-line sonarjs/cognitive-complexity
  public static async getDailyInfo(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const appointments = await Appointment.findAll({
      where: {
        service_provider_user_id: ctx.user.id,
        datetime_utc: {
          [Op.gte]: startOfDay(new Date()),
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
}
