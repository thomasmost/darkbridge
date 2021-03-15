import parseISO from 'date-fns/parseISO';
import format from 'date-fns/format';
import add from 'date-fns/add';
import sub from 'date-fns/sub';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { differenceInMinutes, isAfter, isBefore, isEqual } from 'date-fns';

const DATETIME_LOCAL_REGEX = /^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|0[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/;

export class DateTimeHelper {
  static checkEquality(date1: Date, date2: Date) {
    return isEqual(date1, date2);
  }

  static parseISO(datestring: string) {
    return parseISO(datestring);
  }

  static formatToPureDateTime(date: Date) {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  }

  static formatForDayHeader(date: Date) {
    return format(date, 'eeee');
  }

  static differenceInMinutes(first: Date, second: Date) {
    return differenceInMinutes(first, second);
  }

  static add(
    originalDate: Date,
    count: number,
    increment: 'years' | 'months' | 'days' | 'minutes',
  ) {
    return add(originalDate, { [increment]: count });
  }

  static subtract(
    originalDate: Date,
    count: number,
    increment: 'years' | 'months' | 'days' | 'minutes',
  ) {
    return sub(originalDate, { [increment]: count });
  }

  static toLocal(date: Date, timezone: string) {
    return this.formatToPureDateTime(utcToZonedTime(date, timezone));
  }

  static toUTC(datetime_local: string, timezone: string) {
    const lengthOfDateTimeString = datetime_local.length;
    if (lengthOfDateTimeString !== 19) {
      throw Error('Expected a local datetime exactly 19 characters long');
    }
    if (!datetime_local.match(DATETIME_LOCAL_REGEX)) {
      throw Error(
        "Expected a local datetime to exactly match the following format: 'YYYY-MM-DD HH:MM:SS'",
      );
    }
    return zonedTimeToUtc(datetime_local, timezone);
  }

  static isBefore(first: Date, second: Date) {
    return isBefore(first, second);
  }
  static isAfter(first: Date, second: Date) {
    return isAfter(first, second);
  }
}
