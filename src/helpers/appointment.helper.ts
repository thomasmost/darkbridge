import { sequelize } from '../sequelize';
import { Op } from 'sequelize';
import { Appointment } from '../models/appointment.model';
import { ClientProfile } from '../models/client_profile.model';
import { DateTimeHelper } from './datetime.helper';
import { ConflictError, LogicalError, NotFoundError } from './error.helper';
import { User } from '../models/user.model';
import { AppointmentPriority, AppointmentStatus } from '../shared/enums';
import { AppointmentActivity } from '../models/appointment_activity.model';

export const createAppointmentForClient = async (
  override_warnings: boolean,
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

  const datetime_utc = DateTimeHelper.toUTC(datetime_local, timezone);
  const datetime_end_utc = DateTimeHelper.add(
    datetime_utc,
    duration_minutes,
    'minutes',
  );

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

  const pluralizedSubjectVerb =
    conflictingAppointments.length === 1
      ? 'appointment overlaps'
      : 'appointments overlap';

  if (conflictingAppointments.length && !override_warnings) {
    throw new ConflictError(
      `${conflictingAppointments.length} existing ${pluralizedSubjectVerb} with this one.`,
    );
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

export async function rescheduleAppointment(
  appointment: Appointment,
  datetime_local: string,
  duration_minutes: number,
  acting_user_id: string,
  reason_for_reschedule: string,
) {
  const client_profile = await ClientProfile.findByPk(
    appointment.client_profile_id,
  );
  if (!client_profile) {
    throw Error(`Client with id ${appointment.client_profile_id} not found`);
  }
  const timezone = client_profile.timezone;

  const datetime_utc = DateTimeHelper.toUTC(datetime_local, timezone);
  const datetime_end_utc = DateTimeHelper.add(
    datetime_utc,
    duration_minutes,
    'minutes',
  );

  validateAppointmentStatusChange(appointment, AppointmentStatus.scheduled);
  appointment.status = AppointmentStatus.scheduled;
  appointment.datetime_utc = datetime_utc;
  appointment.datetime_end_utc = datetime_end_utc;
  const rescheduledAppointment = await appointment.save();
  await AppointmentActivity.create({
    appointment_id: appointment.id,
    acting_user_id: acting_user_id,
    action: 'rescheduled',
    note: reason_for_reschedule,
  });
  return rescheduledAppointment;
}

export async function getConflictingAppointments(
  service_provider_user_id: string,
  datetime_utc: Date,
  datetime_end_utc: Date,
) {
  const overlappingAppointments = await Appointment.findAll({
    where: {
      status: 'scheduled',
      service_provider_user_id,
      [Op.or]: [
        {
          datetime_utc: {
            [Op.gte]: datetime_utc,
            [Op.lt]: datetime_end_utc,
          },
        },
        {
          datetime_end_utc: {
            [Op.gt]: datetime_utc,
            [Op.lte]: datetime_end_utc,
          },
        },
        {
          datetime_utc: {
            [Op.gt]: datetime_utc,
          },
          datetime_end_utc: {
            [Op.lt]: datetime_end_utc,
          },
        },
        {
          datetime_utc: {
            [Op.lt]: datetime_utc,
          },
          datetime_end_utc: {
            [Op.gt]: datetime_end_utc,
          },
        },
      ],
    },
    order: [['datetime_utc', 'ASC']],
  });

  for (const appointment of overlappingAppointments) {
    if (DateTimeHelper.checkEquality(appointment.datetime_utc, datetime_utc)) {
      throw new LogicalError('Appointments may not begin at the same time');
    }
  }
  return overlappingAppointments;
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
      AppointmentStatus.scheduled,
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
