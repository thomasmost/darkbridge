import {
  request,
  summary,
  prefix,
  securityAll,
  tagsAll,
  responses,
  operation,
  body,
} from '@callteddy/koa-swagger-decorator';

import { TeddyRequestContext } from './types';
import { arrayOf } from '../helpers/swagger.helper';
import { NotificationSettingsHelper } from '../helpers/user_settings.helper';
import {
  UserNotification,
  UserNotificationSetting,
  UserNotificationSettingModel,
} from '../models/user_notification_setting.model';

@prefix('/user_notification_setting')
@securityAll([{ token: [] }])
@tagsAll(['userNotificationSetting'])
export class UserNotificationSettingAPI {
  @request('get', '')
  @operation('apiUserNotificationSetting_get')
  @summary("get the full list of a user's notification settings")
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

  @request('put', '/single')
  @operation('apiUserNotificationSetting_updateSingle')
  @summary('update a specific notification setting for the user')
  @body({
    notification_id: {
      type: 'string',
      enum: Object.keys(UserNotification as { [key: string]: string }),
      required: true,
    },
    email: {
      type: 'boolean',
      required: true,
    },
    push: {
      type: 'boolean',
      required: true,
    },
    text: {
      type: 'boolean',
      required: true,
    },
  })
  @responses({
    204: {
      description: 'Success',
    },
    401: {
      description: 'Unauthorized',
    },
  })
  public static async updateContractorProfile(ctx: TeddyRequestContext) {
    if (!ctx.user) {
      ctx.status = 401;
      return;
    }
    const user_id = ctx.user.id;

    const { notification_id, email, push, text } = ctx.request.body;

    const [setting] = await UserNotificationSetting.findOrCreate({
      where: {
        user_id,
        notification_id,
      },
      defaults: {
        user_id,
        notification_id,
        email,
        push,
        text,
      },
    });

    setting.email = email;
    setting.push = push;
    setting.text = text;
    setting.updated_at = Date.now();

    await setting.save();

    ctx.status = 204;
  }
}
