import dotenv from 'dotenv';
dotenv.config();
import { Appointment } from '../models/appointment.model';
import { User } from '../models/user.model';
import { sequelize } from '../sequelize';
import { AppointmentPriority, AppointmentStatus } from '../shared/enums';
import {
  getConflictingAppointments,
  loadAndAuthorizeAppointment,
  validateAppointmentStatusChange,
} from './appointment.helper';
import { DateTimeHelper } from './datetime.helper';
import { LogicalError, NotFoundError } from './error.helper';

function buildTestAppointment(status: AppointmentStatus, date?: string) {
  const startDate = date ? new Date(date) : new Date();
  return Appointment.build({
    client_profile_id: 'test_client_id',
    datetime_utc: startDate,
    datetime_end_utc: DateTimeHelper.add(startDate, 60, 'minutes'),
    service_provider_user_id: 'test_user_id',
    summary: 'leaky faucet',
    address_street: '101 Castle Street',
    address_city: 'Brooklyn',
    address_state: 'NY',
    address_postal_code: '11211',
    timezone: 'America/New_York',
    timezone_offset: -5,
    priority: AppointmentPriority.P2,
    status,
  });
}
function buildTestUser(id?: string) {
  return User.build({
    id,
    family_name: 'Strange',
    given_name: 'Jonathan',
    email: 'jonathan_strange@callteddy.com',
    password_hash: 'foo',
    password_salt: 'bar',
  });
}

// eslint-disable-next-line max-lines-per-function
describe('Appointment Helpers', () => {
  afterAll(() => {
    sequelize.close();
  });
  // beforeAll(async () => {
  // });

  describe('getConflictingAppointments', () => {
    test('creating appointments with identical start times should fail', async (done) => {
      expect.assertions(1);
      const original = buildTestAppointment(
        AppointmentStatus.scheduled,
        '2099-01-01 10:30:00',
      );
      await original.save();
      const conflictingDate = new Date('2099-01-01 10:30:00');
      const endDate = DateTimeHelper.add(conflictingDate, 60, 'minutes');
      await expect(
        getConflictingAppointments('test_user_id', conflictingDate, endDate),
      ).rejects.toThrow(LogicalError);
      done();
    });
  });

  describe('loadAndAuthorizeAppointment', () => {
    let appointmentId: string;
    let authorizedUser: User;
    let aDifferentUser: User;
    beforeAll(async () => {
      const appointment = buildTestAppointment(AppointmentStatus.scheduled);
      await appointment.save();
      appointmentId = appointment.id;
      authorizedUser = buildTestUser('test_user_id');
      aDifferentUser = buildTestUser();
    });
    test('trying to load an appointment that exists for a different user should throw', async (done) => {
      expect.assertions(1);
      await expect(
        loadAndAuthorizeAppointment(appointmentId, aDifferentUser),
      ).rejects.toThrow(NotFoundError);
      done();
    });
    test('loading an appointment for the owner', async (done) => {
      const appointment = await loadAndAuthorizeAppointment(
        appointmentId,
        authorizedUser,
      );
      expect(appointment.summary).toBe('leaky faucet');
      done();
    });
  });
  describe('validateAppointmentStatusChange', () => {
    const scheduled_appointment = buildTestAppointment(
      AppointmentStatus.scheduled,
    );
    const in_progress_appointment = buildTestAppointment(
      AppointmentStatus.in_progress,
    );
    const canceled_appointment = buildTestAppointment(
      AppointmentStatus.canceled,
    );
    test('validate starting a scheduled appointment', async (done) => {
      expect.assertions(1);
      expect(() =>
        validateAppointmentStatusChange(
          scheduled_appointment,
          AppointmentStatus.in_progress,
        ),
      ).not.toThrow();
      done();
    });
    test('prevent starting an already in-progress appointment', async (done) => {
      expect.assertions(1);
      expect(() =>
        validateAppointmentStatusChange(
          in_progress_appointment,
          AppointmentStatus.in_progress,
        ),
      ).toThrow('Only scheduled appointments may be started');
      done();
    });
    test('validate completing an appointment', async (done) => {
      expect.assertions(2);
      expect(() =>
        validateAppointmentStatusChange(
          in_progress_appointment,
          AppointmentStatus.completed,
        ),
      ).not.toThrow();
      expect(() =>
        validateAppointmentStatusChange(
          scheduled_appointment,
          AppointmentStatus.completed,
        ),
      ).not.toThrow();
      done();
    });
    test('prevent completing a canceled appointment', async (done) => {
      expect.assertions(1);
      expect(() =>
        validateAppointmentStatusChange(
          canceled_appointment,
          AppointmentStatus.completed,
        ),
      ).toThrow('A canceled appointment cannot be completed');
      done();
    });
    test('validate missing an appointment', async (done) => {
      expect.assertions(1);
      expect(() =>
        validateAppointmentStatusChange(
          scheduled_appointment,
          AppointmentStatus.missed,
        ),
      ).not.toThrow();
      done();
    });
    test('validate moving an appointment to pending_resolution', async (done) => {
      expect.assertions(1);
      expect(() =>
        validateAppointmentStatusChange(
          in_progress_appointment,
          AppointmentStatus.pending_resolution,
        ),
      ).not.toThrow();
      done();
    });
  });
});
