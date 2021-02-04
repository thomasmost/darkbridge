import { clientTokenStore } from '../clientTokenStore';
import { authorizedFetch } from './api.svc';

export function getAppointments() {
  return authorizedFetch('appointment');
}

export function getDailyInfo() {
  return authorizedFetch('appointment/daily');
}
