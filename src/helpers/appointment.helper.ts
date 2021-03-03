import { Op } from 'sequelize';
import { Appointment, AppointmentPriority } from '../models/appointment.model';
import { ClientProfile } from '../models/client_profile.model';
import { DateTimeHelper } from './datetime.helper';
import { CollisionError } from './error.helper';

export const createAppointmentForClient = async (
  service_provider_user_id: string,
  client_profile_id: string,
  datetime_local: string,
  duration_minutes: number,
  priority: keyof typeof AppointmentPriority,
  summary: string,
) => {
  const client_profile = await ClientProfile.findByPk(client_profile_id);
  if (!client_profile) {
    throw Error(`Client with id ${client_profile_id} not found`);
  }
  const timezone = client_profile.timezone;
  const timezone_offset = client_profile.timezone_offset;

  const datetime_utc = DateTimeHelper.toUTC(
    datetime_local,
    timezone,
  ).toISOString();
  const date_utc = new Date(datetime_utc);
  const date_end_utc = DateTimeHelper.add(
    date_utc,
    duration_minutes,
    'minutes',
  );
  const datetime_end_utc = date_end_utc.toISOString();

  const {
    address_street,
    address_city,
    address_state,
    address_postal_code,
  } = client_profile;

  const conflictingAppointments = await getConflictingAppointments(
    service_provider_user_id,
    datetime_utc,
    datetime_end_utc,
  );

  if (conflictingAppointments.length) {
    throw new CollisionError('An existing appointment conflicts');
  }

  return Appointment.create({
    client_profile_id,
    datetime_utc,
    datetime_end_utc,
    service_provider_user_id,
    summary,
    address_street,
    address_city,
    address_state,
    address_postal_code,
    timezone,
    timezone_offset,
    priority,
  });
};

export async function getConflictingAppointments(
  service_provider_user_id: string,
  datetime_utc: string,
  datetime_end_utc: string,
) {
  return Appointment.findAll({
    where: {
      service_provider_user_id,
      [Op.or]: [
        {
          datetime_utc: {
            [Op.gte]: datetime_utc,
            [Op.lte]: datetime_end_utc,
          },
        },
        {
          datetime_end_utc: {
            [Op.gte]: datetime_utc,
            [Op.lte]: datetime_end_utc,
          },
        },
      ],
    },
  });
}
