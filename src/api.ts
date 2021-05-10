import Koa from 'koa';
import { AuthAPI } from './api/auth.api';
import { AppointmentAPI } from './api/appointment.api';
import { ClientConfirmationAPI } from './api/client_confirmation.api';
import { ContractorProfileAPI } from './api/contractor_profile.api';
import { UserAPI } from './api/user.api';
import { ClientProfileAPI } from './api/client_profile.api';
import { getTimeZone } from './helpers/location.helper';
import { SwaggerRouter } from '@callteddy/koa-swagger-decorator';
import { CalendarAPI } from './api/calendar.api';
import { SemiAuthenticatedRequestContext } from './api/types';
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
import { InvoiceItemModel } from './models/invoice_item.model';
import { TaxableLaborType } from './data/taxes';
import { StripeAPI } from './api/stripe.api';
import { orderEmail } from './task';
import { kirk } from './helpers/log.helper';
import { DateTimeHelper } from './helpers/datetime.helper';
import { constructEmail, testEmailTemplate } from './helpers/email.helper';
// import { AppConfig } from './config';

export const api = new SwaggerRouter();

const protectDeveloperDocs = async (
  ctx: SemiAuthenticatedRequestContext,
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
api.use(async (ctx: SemiAuthenticatedRequestContext, next) => {
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
        InvoiceItemModel,
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
      NextAvailableSlot: {
        type: 'object',
        properties: {
          suggestion: {
            type: 'string',
            example: `blah`,
          },
        },
      },
      /**
  state: string;
  state_sales_tax: number;
  rank_state: number;
  avg_local_sales_tax: number;
  combined_avg_sales_tax_rate: number;
  rank_combined: number;
  max_local_sales_tax: number;
  taxable_labor: TaxableLaborType[]; */
      StateTaxInfo: {
        type: 'object',
        properties: {
          state: {
            type: 'string',
            example: 'Alabama',
          },
          state_sales_tax: {
            type: 'number',
            example: '4.22',
            description: 'State sales tax in percent',
          },
          rank_state: {
            type: 'number',
            example: '15',
            description: `State's rank by tax rate`,
          },
          avg_local_sales_tax: {
            type: 'number',
            example: '4.22',
            description: 'Average local sales tax in percent',
          },
          combined_avg_sales_tax_rate: {
            type: 'number',
            example: '8.22',
            description: 'Average combined total sales tax in percent',
          },
          rank_combined: {
            type: 'number',
            example: '15',
            description: `State's rank by combined average tax rate`,
          },
          max_local_sales_tax: {
            type: 'number',
            example: '5.44',
            description: 'Greatest local tax rate in percent',
          },
          taxable_labor: {
            type: 'array',
            items: {
              type: 'string',
              enum: Object.values(TaxableLaborType),
            },
          },
        },
      },
      IsoState: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Alabama',
            description: 'the subdivision name',
          },
          code: {
            type: 'string',
            example: 'US-AL',
            description: 'the subdivision code',
          },
          subdivision_category: {
            type: 'string',
            example: 'state',
            description: 'the subdivision category',
          },
        },
      },
      InvoiceItemMetadata: {
        type: 'object',
        properties: {
          suggested_tax_rate: {
            type: 'number',
            example: '4.5',
            description:
              'the suggested tax rate as represented by this line item',
          },
          entered_tax_rate: {
            type: 'number',
            example: '4.9',
            description:
              'the user-agreed-upon tax rate as represented by this line item',
          },
          state_of_suggested_tax_rate: {
            type: 'string',
            example: 'Alabama',
            description:
              "the state of the suggested tax rate, usually the customer's state of address",
          },
        },
      },
      StripePublicKeyResponse: {
        type: 'object',
        properties: {
          STRIPE_PUBLIC_KEY: {
            type: 'string',
          },
        },
      },
      StripeClientSecretResponse: {
        type: 'object',
        properties: {
          client_secret: {
            type: 'string',
          },
        },
      },
      StripeAccountResponse: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
          },
        },
      },
      SuccessfulStripeSetupIntent: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          created_at: {
            type: 'integer',
          },
          payment_method: {
            type: 'string',
          },
          payment_method_types: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          status: {
            type: 'string',
          },
          usage: {
            type: 'string',
          },
        },
      },
      SuccessfulStripePaymentIntent: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          created_at: {
            type: 'integer',
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
          state_taxes: {
            type: 'array',
            items: swaggerRefFromDefinitionName('StateTaxInfo'),
          },
          iso_states: {
            type: 'array',
            items: swaggerRefFromDefinitionName('IsoState'),
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
api.map(ClientConfirmationAPI, {});
api.map(AuthAPI, {});
api.map(OmniAPI, {});
api.map(StripeAPI, {});

api.get('/test_crash', () => {
  process.exit(1);
});

api.get('/test_error', () => {
  throw new Error('Foo');
});

api.get('/test_worker', async (ctx) => {
  kirk.info('Assigning task to worker');
  const date = new Date();
  const formatted = DateTimeHelper.formatToPureDateTime(date);
  const data = {
    to: 'thomas@callteddy.com',
    subject: 'Reset your password',
    html: constructEmail(testEmailTemplate, {
      user_name: 'Thomas',
      date: formatted,
    }),
    text: `This is a test`,
  };
  await orderEmail(data);
  kirk.info('Assignment Complete');
  ctx.status = 204;
});

api.get('/timezone', async (ctx) => {
  const { city, state } = ctx.request.query;
  ctx.body = await getTimeZone(city, state);
});
