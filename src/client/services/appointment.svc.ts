import { AppointmentAttributes } from '../../models/appointment.model';
import { apiRequest } from './api.svc';

export function getAppointments() {
  return apiRequest('appointment', 'json');
}

export function getDailyInfo() {
  return apiRequest<{
    summary: string;
    appointments: AppointmentAttributes[];
    nextAppointment: AppointmentAttributes;
  }>('calendar/daily', 'json');
}

type AppointmentQueryParams = {
  ids?: string[];
  before?: string;
  after?: string;
};

export function queryAppointments(queryParams: AppointmentQueryParams) {
  const baseUrl = 'appointment';
  const { ids, before, after } = queryParams;
  if (!ids && !before && !after) {
    throw Error('You must provide at least one queryParam');
  }
  let queryUrl = baseUrl + '?';
  if (before) {
    queryUrl += `before=${encodeURIComponent(before)}&`;
  }
  if (after) {
    queryUrl += `after=${encodeURIComponent(after)}&`;
  }
  if (ids) {
    for (const id of ids) {
      queryUrl += `ids=${id}&`;
    }
  }
  return apiRequest(queryUrl, 'json');
}
