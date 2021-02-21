import Router from 'koa-router';
import { authAPI } from './api/auth.api';
import { appointmentAPI } from './api/appointment.api';
import { contractorProfileAPI } from './api/contractor_profile.api';
import { userAPI } from './api/user.api';
import { clientProfileAPI } from './api/client_profile.api';
import { getTimeZone } from './helpers/timezone.helper';

export const api = new Router();

api.use(
  '/appointment',
  appointmentAPI.routes(),
  appointmentAPI.allowedMethods(),
);
api.use(
  '/contractor_profile',
  contractorProfileAPI.routes(),
  contractorProfileAPI.allowedMethods(),
);
api.use(
  '/client_profile',
  clientProfileAPI.routes(),
  clientProfileAPI.allowedMethods(),
);
api.use('/user', userAPI.routes(), userAPI.allowedMethods());
api.use('/auth', authAPI.routes(), authAPI.allowedMethods());

api.get('/test_crash', () => {
  process.exit(1);
});

api.get('/timezone', async (ctx) => {
  const { city, state } = ctx.request.query;
  ctx.body = await getTimeZone(city, state);
});

api.get('/get_secret_var', (ctx) => {
  ctx.body = {
    var: process.env.EXAMPLE_SECRET_VARIABLE || 'None Found',
  };
});

api.get('/get_public_var', (ctx) => {
  ctx.body = {
    var: process.env.NODE_ENV || 'None Found',
  };
});
