import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { DateTimeHelper } from './datetime.helper';

// eslint-disable-next-line max-lines-per-function
describe('DateTimeHelper', () => {
  test('checkEquality should return true two identical UTC dates', () => {
    // This is kind of a stupid test, but I'm just setting a baseline for now
    const first = new Date('2050-01-01 10:30:00');
    const second = utcToZonedTime(first, 'America/Chicago');
    const secondInUtc = zonedTimeToUtc(second, 'America/Chicago');
    expect(DateTimeHelper.checkEquality(first, secondInUtc)).toBe(true);
  });
});
