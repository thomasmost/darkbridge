import { endOfWeek, startOfWeek } from 'date-fns';
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
  beforeMs?: number;
  afterMs?: number;
};

export function queryAppointments(queryParams: AppointmentQueryParams) {
  const baseUrl = 'appointment';
  const { ids, before, after, beforeMs, afterMs } = queryParams;
  if (!ids && !before && !after && !beforeMs && !afterMs) {
    throw Error('You must provide at least one queryParam');
  }
  let queryUrl = baseUrl + '?';
  if (before) {
    queryUrl += `before=${encodeURIComponent(before)}&`;
  }
  if (after) {
    queryUrl += `after=${encodeURIComponent(after)}&`;
  }
  if (beforeMs) {
    queryUrl += `beforeMs=${beforeMs}&`;
  }
  if (afterMs) {
    queryUrl += `afterMs=${afterMs}&`;
  }
  if (ids) {
    for (const id of ids) {
      queryUrl += `ids=${id}&`;
    }
  }
  return apiRequest(queryUrl, 'json');
}

export function getCalendar() {
  const today = new Date();
  const afterMs = startOfWeek(today).valueOf();
  const beforeMs = endOfWeek(today).valueOf();
  return queryAppointments({
    beforeMs,
    afterMs,
  });
}
