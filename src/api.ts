import Router from 'koa-router';
import { authAPI } from './api/auth.api';
import { appointmentAPI } from './api/appointment.api';
import { doMath } from './api/do_math';

export const api = new Router();

api.use(
  '/appointment',
  appointmentAPI.routes(),
  appointmentAPI.allowedMethods(),
);
api.use('/auth', authAPI.routes(), authAPI.allowedMethods());

api.get('/test_crash', () => {
  process.exit(1);
});

api.get('/do_math', (ctx) => {
  const { x, y } = ctx.request.query;
  ctx.body = doMath(x, y);
});

api.get('/get_secret_var', (ctx) => {
  ctx.body = {
    var: process.env.EXAMPLE_SECRET_VARIABLE || 'None Found',
  };
});

api.get('/get_public_var', (ctx) => {
  ctx.body = {
    var: process.env.EXAMPLE_PUBLIC_VARIABLE || 'None Found',
  };
});
