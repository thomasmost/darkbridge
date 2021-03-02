import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from '@reach/router';

import { theme } from '../theme';

import { getDailyInfo } from '../services/appointment.svc';
import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentCard } from '../components/AppointmentCard';
import { ClientCard } from '../components/ClientCard';
import { DispatchContext } from '../reducers';

const HeadingText = styled.h1`
  padding-bottom: 10px;
  font-size: 1.6em;
  font-weight: 600;
  color: ${theme.pageHeaderColor};
`;

const Summary = styled.p`
  margin: 20px 0 0px;
`;

const NextAppointmentHeader = styled.div`
  color: #999;
  margin: 40px 0 15px;
`;

const WrapperLink = styled(Link)`
  &:visited {
    color: ${theme.textColor};
  }
`;

export const renderAppointmentInfo = (
  appointment: AppointmentAttributes | null,
) => {
  if (!appointment) {
    return <div>No upcoming appointments!</div>;
  }
  return (
    <WrapperLink to="/next-appointment">
      <AppointmentCard appointment={appointment} interactive />
    </WrapperLink>
  );
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

export const Home: React.FC<RouteComponentProps> = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const dispatch = useContext(DispatchContext);
  const [
    nextAppointment,
    setNextAppointment,
  ] = useState<AppointmentAttributes | null>(null);

  useEffect(() => {
    getDailyInfo().then((result) => {
      if (result.error) {
        return;
      }
      dispatch({ type: 'SET_APPOINTMENTS', data: result.data.appointments });
      setSummary(result.data.summary);
      setNextAppointment(result.data.nextAppointment);
    });
  }, []);

  let greeting = 'Hello';
  const hours = new Date().getHours();
  if (hours < 12) {
    greeting = 'Good Morning';
  } else {
    greeting = 'Good Afternoon';
  }
  if (hours > 18) {
    greeting = 'Good Evening';
  }
  return (
    <div>
      <HeadingText>{greeting}</HeadingText>
      <Summary>{summary}</Summary>
      {Boolean(nextAppointment) && (
        <>
          <NextAppointmentHeader>Next appointment</NextAppointmentHeader>
          {renderAppointmentInfo(nextAppointment)}
        </>
      )}
      {Boolean(nextAppointment) && (
        <>
          <NextAppointmentHeader>Customer</NextAppointmentHeader>
          {renderCustomerInfo(nextAppointment)}
        </>
      )}
    </div>
  );
};
