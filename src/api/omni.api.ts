import { addMonths, subMonths } from 'date-fns';
import { TeddyRequestContext } from './types';
import { Op } from 'sequelize';
import {
  request,
  summary,
  prefix,
  tags,
  description,
  responses,
} from '@callteddy/koa-swagger-decorator';

import { assembleDailyInfo } from './calendar.api';
import { Appointment, AppointmentModel } from '../models/appointment.model';
import {
  ClientProfile,
  ClientProfileModel,
} from '../models/client_profile.model';
import { ContractorProfile } from '../models/contractor_profile.model';
import { permissionUser, UserModel } from '../models/user.model';
import { arrayOf, swaggerSchemaFromModel } from '../helpers/swagger.helper';

const OmniTag = tags(['omni']);

@prefix('/omni')
export class OmniAPI {
  @OmniTag
  @request('get', '/v0/service')
  @summary(
    'query all the data required to use the app as a service provider/contractor',
  )
  @description(
    'This endpoint will be used to immediately load all the data the app is likely to need for an average session. This includes the full current user with contractor profile, all appointments from one month in the past to one month in the future, the daily calendar data, and all client profiles created by the logged in user',
  )
  @responses({
    200: {
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          allAppointmentsWithinMonth: arrayOf(AppointmentModel),
          clients: arrayOf(ClientProfileModel),
          currentUser: swaggerSchemaFromModel(UserModel),
          dailyInfo: {
            type: 'object',
            properties: {
              appointments: arrayOf(AppointmentModel),
              nextAppointment: swaggerSchemaFromModel(AppointmentModel),
              summary: {
                type: 'string',
                example: `Looks like you don't have any appointments today. Time to kick back! (Alternatively, you can head over to your Calendar to add a new job)`,
              },
            },
          },
        },
      },
    },
    401: {
      description: 'Unauthorized',
    },
  })
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

    ctx.body = {
      allAppointmentsWithinMonth,
      clients,
      currentUser,
      dailyInfo,
    };
  }
}
