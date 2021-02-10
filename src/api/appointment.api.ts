import Koa from 'koa';
import Router from 'koa-router';
import { format } from 'date-fns';
import { Appointment } from '../models/appointment.model';
import { getById } from './base.api';

// import { WhereAttributeHash } from 'sequelize/types';
// import {
//   Appointment,
//   AppointmentAttributes,
// } from '../models/appointment.model';

export const appointmentAPI = new Router();

export async function getDailyInfo(ctx: Koa.ParameterizedContext) {
  const appointments = [
    {
      id: 'foo',
      status: 'complete',
      datetime_local: '2020-02-04 0:30:00',
      datetime_utc: '2020-02-04 5:30:00',
      duration: 60,
    },
    {
      id: 'bar',
      status: 'scheduled',
      datetime_local: '2020-02-04 10:30:00',
      datetime_utc: '2020-02-04 15:30:00',
      duration: 60,
    },
    {
      id: 'baz',
      status: 'scheduled',
      datetime_local: '2020-02-04 15:00:00',
      datetime_utc: '2020-02-04 20:00:00',
      duration: 90,
    },
  ];

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
  const lastAppointmentDate = new Date(lastAppointment.datetime_local);
  const doneBy = new Date(lastAppointment.datetime_local);
  doneBy.setMinutes(
    lastAppointmentDate.getMinutes() + lastAppointment.duration,
  );
  let completed = 0;
  let nextAppointment = null;
  for (const appointment of appointments) {
    if (appointment.status === 'complete') {
      completed++;
    }
    if (appointment.status === 'scheduled' && nextAppointment === null) {
      nextAppointment = appointment;
    }
  }
  if (completed === 0) {
    ctx.body = {
      appointments,
      nextAppointment,
      summary: `Today you have ${countAppointments} appointments, within a 15 mile radius. You should be done by ${doneBy}.`,
    };
    return;
  }
  ctx.body = {
    appointments,
    nextAppointment,
    summary: `Today you have ${countAppointments} appointments, within a 15 mile radius. You've already knocked out ${completed}! You should be done by ${format(
      doneBy,
      'h:ma',
    )} this evening.`,
  };
}

appointmentAPI.get('/daily', getDailyInfo);

export async function getAppointments(ctx: Koa.ParameterizedContext) {
  ctx.body = [];
  ctx.status = 200;
}

appointmentAPI.get('/', getAppointments);

appointmentAPI.get('/:id', getById(Appointment));

export async function createAppointment(ctx: Koa.ParameterizedContext) {
  throw Error('Not Yet Implemented');
}

appointmentAPI.post('/', createAppointment);

export async function cancelAppointment(ctx: Koa.ParameterizedContext) {
  throw Error('Not Yet Implemented');
}

appointmentAPI.put('/:id/cancel', cancelAppointment);
