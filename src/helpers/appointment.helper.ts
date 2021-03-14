import { sequelize } from '../sequelize';
import { Op } from 'sequelize';
import {
  Appointment,
  AppointmentPriority,
  AppointmentStatus,
} from '../models/appointment.model';
import { ClientProfile } from '../models/client_profile.model';
import { DateTimeHelper } from './datetime.helper';
import { LogicalError, NotFoundError } from './error.helper';
import { User } from '../models/user.model';

export const createAppointmentForClient = async (
  service_provider_user_id: string,
  client_profile_id: string,
  datetime_local: string,
  duration_minutes: number,
  priority: AppointmentPriority,
  summary: string,
) => {
  const client_profile = await ClientProfile.findByPk(client_profile_id);
  if (!client_profile) {
    throw Error(`Client with id ${client_profile_id} not found`);
  }
  const timezone = client_profile.timezone;
  const timezone_offset = client_profile.timezone_offset;
  const coordinates = client_profile.coordinates;

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
    throw new LogicalError('An existing appointment conflicts');
  }

  const status = AppointmentStatus.scheduled;

  const appointment = await Appointment.create({
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
    status,
  });

  const [lat, lng] = coordinates.coordinates;

  // Bec
  await sequelize.query(
    `update appointment set coordinates=ST_GeomFromText('POINT(${lat} ${lng})') WHERE id='${appointment.id}'`,
  );

  return Appointment.findByPk(appointment.id);
};

export async function getConflictingAppointments(
  service_provider_user_id: string,
  datetime_utc: string,
  datetime_end_utc: string,
) {
  return Appointment.findAll({
    where: {
      status: 'scheduled',
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

const LEGAL_STATUS_TRANSITIONS: Record<
  AppointmentStatus,
  {
    error_message: string;
    prior_statuses: AppointmentStatus[];
  }
> = {
  requested: {
    error_message: 'Requested is an initial state',
    prior_statuses: [],
  },
  scheduled: {
    error_message:
      'Appointments that have already been started cannot be rescheduled',
    prior_statuses: [
      AppointmentStatus.missed,
      AppointmentStatus.canceled,
      AppointmentStatus.requested,
    ],
  },
  canceled: {
    error_message: 'Only scheduled appointments may be canceled',
    prior_statuses: [AppointmentStatus.scheduled],
  },
  in_progress: {
    error_message: 'Only scheduled appointments may be started',
    prior_statuses: [AppointmentStatus.scheduled],
  },
  missed: {
    error_message: 'Only scheduled appointments can be missed',
    prior_statuses: [AppointmentStatus.scheduled],
  },
  pending_resolution: {
    error_message:
      'Only in-progress appointments can be moved to a pending-resolution state',
    prior_statuses: [AppointmentStatus.in_progress],
  },
  completed: {
    error_message: 'A canceled appointment cannot be completed',
    prior_statuses: [
      AppointmentStatus.scheduled,
      AppointmentStatus.in_progress,
      AppointmentStatus.pending_resolution,
      AppointmentStatus.missed,
    ],
  },
};

export async function loadAndAuthorizeAppointment(
  appointment_id: string,
  user: User,
) {
  const appointment = await Appointment.findByPk(appointment_id);

  // If either the appointment doesn't exist or doesn't belong to the logged in user, 404 (since we don't want to indicate whether or not the appointment exists)
  if (!appointment || appointment.service_provider_user_id !== user.id) {
    throw new NotFoundError();
  }
  return appointment;
}

export function validateAppointmentStatusChange(
  appointment: Appointment,
  new_status: AppointmentStatus,
) {
  const transition = LEGAL_STATUS_TRANSITIONS[new_status];
  if (!transition.prior_statuses.includes(appointment.status)) {
    throw new LogicalError(transition.error_message);
  }
}
