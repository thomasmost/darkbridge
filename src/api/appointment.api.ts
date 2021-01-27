import Koa from 'koa';
import Router from 'koa-router';
// import { WhereAttributeHash } from 'sequelize/types';
// import {
//   Appointment,
//   AppointmentAttributes,
// } from '../models/appointment.model';

export const appointmentAPI = new Router();

export async function createAppointment(ctx: Koa.ParameterizedContext) {
  throw Error('Not Yet Implemented');
}

appointmentAPI.post('/', createAppointment);

export async function cancelAppointment(ctx: Koa.ParameterizedContext) {
  throw Error('Not Yet Implemented');
}

appointmentAPI.put('/:id/cancel', cancelAppointment);
