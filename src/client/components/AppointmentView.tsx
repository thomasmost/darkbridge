import styled from '@emotion/styled';
import React from 'react';
import { theme } from '../theme';

import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentCard } from './AppointmentCard';
import { ClientCard } from './ClientCard';
import { Icon } from '../elements/Icon';
import { Link } from '@reach/router';

const HeadingText = styled.h2`
  margin-bottom: 20px;
  font-size: 1.6em;
  color: ${theme.pageHeaderColor};
`;

const Card = styled.div`
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px 20px ${theme.boxShadowColor};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  padding: 20px;
  margin: 50px 0;
  color: ${theme.warningColor};
`;
const CardArrow = styled.div`
  width: 20px;
  max-width: 20px;
  font-size: 32px;
  color: ${theme.warningColor};
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
    <Card>
      <div>Cancel Appointment</div>
      <CardArrow>
        <Icon name="Arrow-Right-2" />
      </CardArrow>
    </Card>
  </Link>
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
  return (
    <div>
      <HeadingText>{header}</HeadingText>
      {renderAppointmentInfo(appointment)}
      {renderCancelCard(appointment.id)}
      {renderCustomerInfo(appointment)}
    </div>
  );
};
