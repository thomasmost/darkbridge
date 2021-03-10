import {
  UserNotification,
  UserNotificationSetting,
} from '../models/user_notification_setting.model';

export type NotificationSetting = {
  name: string;
  email: boolean;
  push: boolean;
  text: boolean;
};
export type NotificationSettingWithId = {
  notification_id: UserNotification;
  name: string;
  email: boolean;
  push: boolean;
  text: boolean;
};

export abstract class NotificationSettingsHelper {
  public static defaults(): Record<UserNotification, NotificationSetting> {
    return {
      daily_kickoff: {
        name: 'Daily Kick-off',
        email: true,
        push: true,
        text: false,
      },
      appointment_reminder: {
        name: 'Appointment Reminders',
        email: false,
        push: true,
        text: false,
      },
      start_work_reminder: {
        name: 'Start Work Reminders',
        email: false,
        push: true,
        text: false,
      },
    };
  }

  public static rngDefaults(): NotificationSettingWithId[] {
    const defaults = this.defaults();
    const rngDefaults: NotificationSettingWithId[] = [];
    for (const key of Object.keys(defaults)) {
      const notification_id = key as UserNotification;
      const defaultSetting = defaults[notification_id];
      rngDefaults.push({ ...defaultSetting, notification_id });
    }
    return rngDefaults;
  }

  public static async getForUser(user_id: string) {
    const defaults = this.rngDefaults();
    const settings = await UserNotificationSetting.findAll({
      where: {
        user_id,
      },
    });
    const settingsByNotificationId = {} as Record<
      UserNotification,
      UserNotificationSetting
    >;
    for (const setting of settings) {
      settingsByNotificationId[setting.notification_id] = setting;
    }
    for (const defaultSetting of defaults) {
      const { notification_id, email, push, text } = defaultSetting;
      if (settingsByNotificationId[notification_id]) {
        // an override already exists
        continue;
      }
      settingsByNotificationId[notification_id] = UserNotificationSetting.build(
        {
          user_id,
          notification_id,
          email,
          push,
          text,
        },
      );
    }
    return Object.values(settingsByNotificationId);
  }
}
