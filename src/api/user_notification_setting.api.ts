import {
  request,
  summary,
  prefix,
  securityAll,
  tagsAll,
  responses,
  operation,
} from '@callteddy/koa-swagger-decorator';

import { TeddyRequestContext } from './types';
import { arrayOf } from '../helpers/swagger.helper';
import { NotificationSettingsHelper } from '../helpers/user_settings.helper';
import { UserNotificationSettingModel } from '../models/user_notification_setting.model';

@prefix('/user_notification_setting')
@securityAll([{ token: [] }])
@tagsAll(['userNotificationSetting'])
export class UserNotificationSettingAPI {
  @request('get', '')
  @operation('apiUserNotificationSetting_get')
  @summary('get the full list of available user notification settings')
  @responses({
    200: {
      description: 'Success',
      schema: arrayOf(UserNotificationSettingModel),
    },
    401: {
      description: 'Unauthorized',
    },
  })
  public static async queryUserNotificationSettings(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user = ctx.user;
    const settings = await NotificationSettingsHelper.getForUser(user.id);
    ctx.status = 200;
    ctx.body = settings;
  }
}
