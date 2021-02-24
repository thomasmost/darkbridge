import Koa from 'koa';
import { authAPI } from './api/auth.api';
import { AppointmentAPI } from './api/appointment.api';
import { ContractorProfileAPI } from './api/contractor_profile.api';
import { UserAPI } from './api/user.api';
import { ClientProfileAPI } from './api/client_profile.api';
import { getTimeZone } from './helpers/timezone.helper';
import { SwaggerRouter } from 'koa-swagger-decorator';
import { CalendarAPI } from './api/calendar.api';
import { TeddyRequestContext } from './api/types';
import { AppConfig } from './config';

export const api = new SwaggerRouter();

const protectDeveloperDocs = async (
  ctx: TeddyRequestContext,
  next: Koa.Next,
) => {
  console.log(JSON.stringify(ctx));
  const user = ctx.user;
  console.log(`USER: ${user?.email}`);
  if (!user || !AppConfig.isStaff(user.email)) {
    ctx.redirect('/login');
    return;
  }
  next();
};

api.use('/swagger-html', protectDeveloperDocs);
api.use('/swagger-json', protectDeveloperDocs);

api.swagger({
  title: 'Teddy Internal API',
  description:
    "API DOC for Teddy's internal-facing API, serving the web and mobile clients",
  version: '0.1.2',
  prefix: '/api',
  swaggerHtmlEndpoint: '/swagger-html',
  swaggerJsonEndpoint: '/swagger-json',
  swaggerOptions: {
    securityDefinitions: {
      token: {
        type: 'apiKey',
        in: 'cookie',
        name: 'teddy_web_token',
      },
    },
  },
});

api.map(UserAPI, {});
api.map(AppointmentAPI, {});
api.map(CalendarAPI, {});
api.map(ContractorProfileAPI, {});
api.map(ClientProfileAPI, {});

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
