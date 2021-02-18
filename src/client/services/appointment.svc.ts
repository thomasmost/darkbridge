import { AppointmentAttributes } from '../../models/appointment.model';
import { apiRequest } from './api.svc';

export function getAppointments() {
  return apiRequest('appointment');
}

export function getDailyInfo() {
  return apiRequest<{
    summary: string;
    nextAppointment: AppointmentAttributes;
  }>('appointment/daily');
}
