import Koa from 'koa';
import { AuthAPI } from './api/auth.api';
import { AppointmentAPI } from './api/appointment.api';
import { ContractorProfileAPI } from './api/contractor_profile.api';
import { UserAPI } from './api/user.api';
import { ClientProfileAPI } from './api/client_profile.api';
import { getTimeZone } from './helpers/timezone.helper';
import { SwaggerRouter } from '@callteddy/koa-swagger-decorator';
import { CalendarAPI } from './api/calendar.api';
import { TeddyRequestContext } from './api/types';
import { OmniAPI } from './api/omni.api';
import { definitionsFromModels } from './helpers/swagger.helper';
import { UserModel } from './models/user.model';
import { ClientProfileModel } from './models/client_profile.model';
import { ContractorProfileModel } from './models/contractor_profile.model';
import { AppointmentModel } from './models/appointment.model';
// import { AppConfig } from './config';

export const api = new SwaggerRouter();

const protectDeveloperDocs = async (
  ctx: TeddyRequestContext,
  next: Koa.Next,
) => {
  // const user = ctx.user;
  // if (!user || !AppConfig.isStaff(user.email)) {
  //   ctx.redirect('/login');
  //   return;
  // }
  next();
};

api.use('/swagger-html', protectDeveloperDocs);
api.use('/swagger-json', protectDeveloperDocs);

api.swagger({
  title: 'Teddy Internal API',
  description:
    "API DOC for Teddy's internal-facing API, serving the web and mobile clients",
  version: '0.1.3',
  prefix: '/api',
  swaggerConfiguration: {
    display: {
      displayOperationId: true,
    },
  },
  swaggerHtmlEndpoint: '/swagger-html',
  swaggerJsonEndpoint: '/swagger-json',
  swaggerOptions: {
    definitions: definitionsFromModels([
      AppointmentModel,
      ClientProfileModel,
      ContractorProfileModel,
      UserModel,
    ]),
    securityDefinitions: {
      token: {
        type: 'apiKey',
        in: 'header',
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
api.map(AuthAPI, {});
api.map(OmniAPI, {});

api.get('/test_crash', () => {
  process.exit(1);
});

api.get('/timezone', async (ctx) => {
  const { city, state } = ctx.request.query;
  ctx.body = await getTimeZone(city, state);
});
