import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect } from 'react';

import { theme } from '../theme';

import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentCard } from '../components/AppointmentCard';
import { ClientCard } from '../components/ClientCard';
import { DispatchContext, StateContext } from '../reducers';
import { queryAppointments } from '../services/appointment.svc';

const WarningHeader = styled.h3`
  font-size: 1.6em;
  font-weight: 600;
  color: ${theme.pageHeaderColor};
  margin: 40px 0 20px;
`;
const WarningText = styled.p``;

export const renderAppointmentInfo = (
  appointment: AppointmentAttributes | null,
) => {
  if (!appointment) {
    return <div>No upcoming appointments!</div>;
  }
  return <AppointmentCard appointment={appointment} warning />;
};

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

export const CancelAppointment: React.FC<
  RouteComponentProps<{ appointment_id: string }>
> = (props) => {
  const { appointments } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);

  const { appointment_id } = props;

  const currentAppointment = appointments?.find(
    (appointment) => appointment.id === appointment_id,
  );

  useEffect(() => {
    if (!appointment_id) {
      return;
    }
    if (currentAppointment) {
      return;
    }
    queryAppointments({ ids: [appointment_id, 'foo'] }).then((result) => {
      if (result.error) {
        return;
      }
      dispatch({ type: 'SET_APPOINTMENTS', data: result.data });
    });
  }, []);

  if (!currentAppointment) {
    return null;
  }
  return (
    <div>
      {renderAppointmentInfo(currentAppointment)}
      <WarningHeader>Are you sure?</WarningHeader>
      <WarningText>
        In general, you shouldn&apos;t cancel an appointment day-of unless
        you&apos;re running more than an hour behind.
      </WarningText>
    </div>
  );
};
