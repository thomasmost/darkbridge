import { addMonths, subMonths } from 'date-fns';
import { AuthenticatedRequestContext } from './types';
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
  middlewaresAll,
} from '@callteddy/koa-swagger-decorator';

import { assembleDailyInfo } from './calendar.api';
import { Appointment } from '../models/appointment.model';
import { ClientProfile } from '../models/client_profile.model';
import {
  ContractorProfile,
  PrimaryWork,
} from '../models/contractor_profile.model';
import {
  baseCodes,
  swaggerRefFromDefinitionName,
} from '../helpers/swagger.helper';
import { NotificationSettingsHelper } from '../helpers/user_settings.helper';
import { AppointmentPriority } from '../shared/enums';
import { stateTaxes } from '../data/taxes';
import { isoStates } from '../data/iso_states';
import { authUser } from './middlewares';

const omniResponsesV0 = {
  200: {
    description: 'Success',
    schema: swaggerRefFromDefinitionName('OmniResponseV0'),
  },
  ...baseCodes([401]),
};
@prefix('/omni')
@securityAll([{ token: [] }])
@middlewaresAll(authUser)
@tagsAll(['omni'])
export class OmniAPI {
  @request('get', '/v0/service')
  @operation('apiOmni_getV0')
  @summary(
    'query all the data required to use the app as a service provider/contractor',
  )
  @description(
    'This endpoint will be used to immediately load all the data the app is likely to need for an average session. This includes the full current user with contractor profile, all appointments from one (1) month in the past to six (6) months in the future, the daily calendar data, and all client profiles created by the logged in user',
  )
  @responses(omniResponsesV0)
  public static async getOmniDataV0(ctx: AuthenticatedRequestContext) {
    const user = ctx.user;
    const user_id = user.id;

    const allAppointmentsWithinMonthPromise = Appointment.findAll({
      where: {
        service_provider_user_id: user_id,
        datetime_utc: {
          [Op.gte]: subMonths(new Date(), 1),
          [Op.lte]: addMonths(new Date(), 6),
        },
      },
      order: [['datetime_utc', 'ASC']],
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
      return user;
    });

    const [
      allAppointmentsWithinMonth,
      dailyInfo,
      clients,
      currentUser,
      userNotificationSettings,
    ] = await Promise.all([
      allAppointmentsWithinMonthPromise,
      assembleDailyInfo(user_id),
      profilesPromise,
      userWithProfilePromise,
      NotificationSettingsHelper.getForUser(user.id),
    ]);

    const enums = {
      primary_work: Object.values(PrimaryWork),
      appointment_priority: Object.values(AppointmentPriority),
    };

    const state_taxes = stateTaxes();
    const iso_states = isoStates();

    ctx.body = {
      // This is poorly named now, oops
      allAppointmentsWithinMonth,
      clients,
      currentUser,
      userNotificationSettings,
      dailyInfo,
      enums,
      state_taxes,
      iso_states,
    };
  }
}
