import { addMonths, subMonths } from 'date-fns';
import { TeddyRequestContext } from './types';
import { Op } from 'sequelize';
import {
  request,
  summary,
  prefix,
  tagsAll,
  description,
  responses,
  securityAll,
  operation,
} from '@callteddy/koa-swagger-decorator';

import { assembleDailyInfo } from './calendar.api';
import {
  Appointment,
  AppointmentModel,
  AppointmentPriority,
} from '../models/appointment.model';
import {
  ClientProfile,
  ClientProfileModel,
} from '../models/client_profile.model';
import {
  ContractorProfile,
  PrimaryWork,
} from '../models/contractor_profile.model';
import { permissionUser, UserModel } from '../models/user.model';
import {
  arrayOf,
  baseCodes,
  swaggerRefFromModel,
} from '../helpers/swagger.helper';

const omniResponsesV0 = {
  200: {
    description: 'Success',
    schema: {
      type: 'object',
      properties: {
        allAppointmentsWithinMonth: arrayOf(AppointmentModel),
        clients: arrayOf(ClientProfileModel),
        currentUser: swaggerRefFromModel(UserModel),
        dailyInfo: {
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
  ...baseCodes([401]),
};
@prefix('/omni')
@securityAll([{ token: [] }])
@tagsAll(['omni'])
export class OmniAPI {
  @request('get', '/v0/service')
  @operation('apiOmni_getV0')
  @summary(
    'query all the data required to use the app as a service provider/contractor',
  )
  @description(
    'This endpoint will be used to immediately load all the data the app is likely to need for an average session. This includes the full current user with contractor profile, all appointments from one month in the past to one month in the future, the daily calendar data, and all client profiles created by the logged in user',
  )
  @responses(omniResponsesV0)
  public static async getOmniDataV0(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user = ctx.user;
    const user_id = user.id;

    const allAppointmentsWithinMonthPromise = Appointment.findAll({
      where: {
        datetime_utc: {
          [Op.gte]: subMonths(new Date(), 1),
          [Op.lte]: addMonths(new Date(), 1),
        },
      },
    });

    const profilesPromise = ClientProfile.findAll({
      where: {
        created_by_user_id: user_id,
      },
      order: [['created_at', 'DESC']],
    });

    const userWithProfilePromise = ContractorProfile.findOne({
      where: {
        user_id: user_id,
      },
    }).then((contractor_profile) => {
      if (contractor_profile) {
        user.contractor_profile = contractor_profile;
      }
      return permissionUser(user);
    });

    const [
      allAppointmentsWithinMonth,
      dailyInfo,
      clients,
      currentUser,
    ] = await Promise.all([
      allAppointmentsWithinMonthPromise,
      assembleDailyInfo(user_id),
      profilesPromise,
      userWithProfilePromise,
    ]);

    const enums = {
      primary_work: Object.values(PrimaryWork),
      appointment_priority: Object.values(AppointmentPriority),
    };

    ctx.body = {
      allAppointmentsWithinMonth,
      clients,
      currentUser,
      dailyInfo,
      enums,
    };
  }
}
