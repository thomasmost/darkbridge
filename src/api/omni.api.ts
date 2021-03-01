import { addMonths, subMonths } from 'date-fns';
import { Appointment } from '../models/appointment.model';
import { TeddyRequestContext } from './types';
import { ClientProfile } from '../models/client_profile.model';
import { Op } from 'sequelize';
import {
  request,
  summary,
  prefix,
  tags,
  description,
} from '@callteddy/koa-swagger-decorator';

import { assembleDailyInfo } from './calendar.api';
import { ContractorProfile } from '../models/contractor_profile.model';
import { permissionUser } from '../models/user.model';

const OmniTag = tags(['omni']);

@prefix('/omni')
export class OmniAPI {
  @OmniTag
  @request('get', '/v0/service')
  @summary(
    'query all the data required to use the app as a service provider/contractor',
  )
  @description(
    'This endpoint will be used to immediately load all the data the app is likely to need for an average session. This includes the full current user with contractor profile, all appointments from two months in the past to two months in the future, the daily calendar data, and all client profiles created by the logged in user',
  )
  public static async getOmniDataV0(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user = ctx.user;
    const user_id = user.id;

    const allAppointmentsWithinTwoMonthsPromise = Appointment.findAll({
      where: {
        datetime_utc: {
          [Op.gte]: subMonths(new Date(), 2),
          [Op.lte]: addMonths(new Date(), 2),
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
      allAppointmentsWithinTwoMonths,
      dailyInfo,
      clients,
      currentUser,
    ] = await Promise.all([
      allAppointmentsWithinTwoMonthsPromise,
      assembleDailyInfo(user_id),
      profilesPromise,
      userWithProfilePromise,
    ]);

    ctx.body = {
      allAppointmentsWithinTwoMonths,
      dailyInfo,
      clients,
      currentUser,
    };
  }
}
