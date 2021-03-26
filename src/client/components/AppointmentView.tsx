import styled from '@emotion/styled';
import React, { Dispatch, useContext } from 'react';
import { theme } from '../theme';

import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentCard } from './AppointmentCard';
import { ClientCard } from './ClientCard';
import { Icon } from '../elements/Icon';
import { Link } from '@reach/router';
import { Card } from '../elements/Card';
import { apiRequest } from '../services/api.svc';
import { Action, DispatchContext } from '../reducers';

const HeadingText = styled.h2`
  margin-bottom: 20px;
  font-size: 1.6em;
  color: ${theme.pageHeaderColor};
`;

const CancelCard = styled(Card)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 50px 0;
  color: ${theme.warningColor};
`;
const StartCard = styled(Card)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  margin-bottom: 50px;
  color: ${theme.buttonColorActive};
`;
const CardArrow = styled.div`
  width: 20px;
  max-width: 20px;
  font-size: 32px;
  color: inherit;
`;

export const renderAppointmentInfo = (
  appointment: AppointmentAttributes | null,
) => {
  if (!appointment) {
    return <div>No upcoming appointments!</div>;
  }
  return <AppointmentCard appointment={appointment} />;
};

export const renderCancelCard = (appointment_id: string) => (
  <Link to={`/cancel-appointment/${appointment_id}`}>
    <CancelCard>
      <div>Cancel Appointment</div>
      <CardArrow>
        <Icon name="Arrow-Right-2" />
      </CardArrow>
    </CancelCard>
  </Link>
);

export const renderRescheduleCard = (appointment_id: string) => (
  <Link to={`/reschedule-appointment/${appointment_id}`}>
    <CancelCard>
      <div>Reschedule Appointment</div>
      <CardArrow>
        <Icon name="Arrow-Right-2" />
      </CardArrow>
    </CancelCard>
  </Link>
);

const startAppointment = async (
  appointment_id: string,
  dispatch: Dispatch<Action<{ appointment_id: string }>>,
) => {
  dispatch({
    type: 'START_APPOINTMENT',
    data: {
      appointment_id,
    },
  });
  await apiRequest(`appointment/${appointment_id}/start`, 'text', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'PUT',
  });
};

export const renderStartCard = (
  appointment_id: string,
  dispatch: Dispatch<Action<{ appointment_id: string }>>,
) => (
  <Link
    to={`/job/${appointment_id}/working`}
    onClick={() => startAppointment(appointment_id, dispatch)}
  >
    <StartCard>
      <div>Start Work</div>
      <CardArrow>
        <Icon name="Arrow-Right-2" />
      </CardArrow>
    </StartCard>
  </Link>
);

export const renderInvoiceCard = (appointment_id: string) => (
  <Link to={`/payment/${appointment_id}/invoice`}>
    <StartCard>
      <div>Complete Invoice</div>
      <CardArrow>
        <Icon name="Arrow-Right-2" />
      </CardArrow>
    </StartCard>
  </Link>
);

export const renderCanceledCard = () => (
  <Card>This appointment has been canceled.</Card>
);

export const renderCustomerInfo = (
  appointment: AppointmentAttributes | null,
) => {
  if (!appointment) {
    return null;
  }
  if (!appointment.client_profile) {
    return <div>No associated client</div>;
  }
  return <ClientCard client={appointment.client_profile} />;
};

type AppointmentViewProps = {
  appointment: AppointmentAttributes;
  header: string;
};

export const AppointmentView: React.FC<AppointmentViewProps> = ({
  appointment,
  header,
}) => {
  const dispatch = useContext(DispatchContext);
  const isCanceled = appointment.status === 'canceled';
  const canBeRescheduled =
    appointment.status !== 'in_progress' && appointment.status !== 'completed';
  const canBeCanceled =
    appointment.status !== 'in_progress' &&
    appointment.status !== 'completed' &&
    appointment.status !== 'canceled';
  const isStartable =
    appointment.status !== 'in_progress' && appointment.status !== 'completed';
  const needsInvoice =
    appointment.status === 'completed' && !appointment.invoice_id;
  // appointment.status === 'scheduled' &&
  // Math.abs(DateTimeHelper.differenceInMinutes(startDate, now)) < 12000;
  return (
    <div>
      <HeadingText>{header}</HeadingText>
      {renderAppointmentInfo(appointment)}
      {isStartable && renderStartCard(appointment.id, dispatch)}
      {needsInvoice && renderInvoiceCard(appointment.id)}
      {renderCustomerInfo(appointment)}{' '}
      {canBeRescheduled && renderRescheduleCard(appointment.id)}
      {canBeCanceled && renderCancelCard(appointment.id)}
      {isCanceled && renderCanceledCard()}
    </div>
  );
};
