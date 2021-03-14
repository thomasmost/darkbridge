import Koa from 'koa';
import { AuthAPI } from './api/auth.api';
import { AppointmentAPI } from './api/appointment.api';
import { ContractorProfileAPI } from './api/contractor_profile.api';
import { UserAPI } from './api/user.api';
import { ClientProfileAPI } from './api/client_profile.api';
import { getTimeZone } from './helpers/location.helper';
import { SwaggerRouter } from '@callteddy/koa-swagger-decorator';
import { CalendarAPI } from './api/calendar.api';
import { TeddyRequestContext } from './api/types';
import { OmniAPI } from './api/omni.api';
import {
  arrayOf,
  definitionsFromModels,
  moveInlinePostBodiesToDefinitions,
  swaggerRefFromDefinitionName,
  swaggerRefFromModel,
} from './helpers/swagger.helper';
import { UserModel } from './models/user.model';
import { ClientProfileModel } from './models/client_profile.model';
import { ContractorProfileModel } from './models/contractor_profile.model';
import { AppointmentModel } from './models/appointment.model';
import { UserNotificationSettingModel } from './models/user_notification_setting.model';
import { UserNotificationSettingAPI } from './api/user_notification_setting.api';
import { InvoiceAPI } from './api/invoice.api';
import { InvoiceModel } from './models/invoice.model';
import { permissionData } from './helpers/permissioners';
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

const postProcessJson = async (
  ctx: Koa.ParameterizedContext,
  next: Koa.Next,
) => {
  next();
  ctx.body = moveInlinePostBodiesToDefinitions(ctx.body);
};

api.use('/swagger-html', protectDeveloperDocs);
api.use('/swagger-json', protectDeveloperDocs, postProcessJson);

// Permissioner
api.use(async (ctx: TeddyRequestContext, next) => {
  await next();
  if (ctx.body) {
    ctx.body = permissionData(ctx.body, ctx.user);
  }
});

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
    definitions: {
      ...definitionsFromModels([
        AppointmentModel,
        ClientProfileModel,
        ContractorProfileModel,
        InvoiceModel,
        UserModel,
        UserNotificationSettingModel,
      ]),
      AuthenticationResult: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
          },
          user: swaggerRefFromModel(UserModel),
        },
      },
      DailyInfo: {
        type: 'object',
        properties: {
          appointments: arrayOf(AppointmentModel),
          nextAppointment: swaggerRefFromModel(AppointmentModel),
          summary: {
            type: 'string',
            example: `Looks like you don't have any appointments today. Time to kick back! (Alternatively, you can head over to your Calendar to add a new job)`,
          },
        },
      },
      OmniResponseV0: {
        type: 'object',
        properties: {
          allAppointmentsWithinMonth: arrayOf(AppointmentModel),
          clients: arrayOf(ClientProfileModel),
          currentUser: swaggerRefFromModel(UserModel),
          userNotificationSettings: arrayOf(UserNotificationSettingModel),
          dailyInfo: swaggerRefFromDefinitionName('DailyInfo'),
          enums: {
            type: 'object',
            properties: {
              primary_work: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
              appointment_priority: {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
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
api.map(UserNotificationSettingAPI, {});
api.map(AppointmentAPI, {});
api.map(InvoiceAPI, {});
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
