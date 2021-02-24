import dotenv from 'dotenv';
import { ParameterizedContext } from 'koa';
dotenv.config();
import { Appointment } from '../models/appointment.model';
import { ClientProfile } from '../models/client_profile.model';
import { sequelize } from '../sequelize';
import { AppointmentAPI } from './appointment.api';

//eslint-disable-next-line max-lines-per-function
describe('Appointment Api', () => {
  const testUserId = 'test_user_id';
  let profile: ClientProfile;

  beforeAll(async () => {
    const profileAttributes = {
      created_by_user_id: testUserId,
      email: 'foo@bar.com',
      full_name: 'foo',
      phone: 'foo',
      address_street: 'foo',
      address_city: 'foo',
      address_state: 'foo',
      address_postal_code: 'foo',
      timezone: 'foo',
    };

    profile = await ClientProfile.create(profileAttributes);

    await Appointment.destroy({
      truncate: true,
    });
  });
  afterAll(() => {
    sequelize.close();
  });

  test('creating an appointment should work', async (done) => {
    const user = {
      id: testUserId,
    };

    const body = {
      client_profile_id: profile.id,
      datetime_local: 'Sun, 21 Feb 2021 05:00:00 GMT',
      duration_minutes: 90,
      priority: 'P2',
      summary: 'leaky faucet',
    };

    const ctx = ({
      user,
      request: {
        body,
      },
      cookies: {
        set: () => null,
      },
      ip: 'TEST::1',
    } as unknown) as ParameterizedContext;

    await AppointmentAPI.createAppointment(ctx);

    const appointment = await Appointment.findOne({
      where: {
        summary: 'leaky faucet',
      },
    });

    expect(appointment?.id).toBeDefined();
    expect(appointment?.priority).toBe('P2');
    expect(appointment?.address_street).toBe('foo');
    done();
  });

  test('creating an appointment that conflicts with an existing appointment should throw a 405', async (done) => {
    expect.assertions(2);
    const user = {
      id: testUserId,
    };

    const body = {
      client_profile_id: profile.id,
      datetime_local: 'Tuesday, 10 Feb 2021 05:00:00 GMT',
      duration_minutes: 90,
      priority: 'P2',
      summary: 'leaky drainpipe',
    };

    const ctx = ({
      user,
      request: {
        body,
      },
      cookies: {
        set: () => null,
      },
      ip: 'TEST::1',
    } as unknown) as ParameterizedContext;

    await AppointmentAPI.createAppointment(ctx);

    const body2 = {
      client_profile_id: profile.id,
      datetime_local: 'Tuesday, 10 Feb 2021 05:00:00 GMT',
      duration_minutes: 90,
      priority: 'P2',
      summary: 'sparking lamp',
    };

    const ctx2 = ({
      user,
      request: {
        body: body2,
      },
      cookies: {
        set: () => null,
      },
      ip: 'TEST::1',
    } as unknown) as ParameterizedContext;

    await expect(AppointmentAPI.createAppointment(ctx2)).rejects.toThrow(
      'An existing appointment conflicts',
    );

    const appointment = await Appointment.findOne({
      where: {
        summary: 'sparking lamp',
      },
    });

    expect(appointment).toBeNull();
    done();
  });
});
