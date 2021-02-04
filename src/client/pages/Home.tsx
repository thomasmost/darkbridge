import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';
import { theme } from '../theme';
import { format } from 'date-fns';

import { getDailyInfo } from '../services/appointment.svc';

const HeadingText = styled.h1`
  padding-bottom: 10px;
  font-size: 2em;
  color: ${theme.pageHeaderColor};
`;

const Summary = styled.div`
  margin: 20px 0 30px;
`;

const NextAppointmentHeader = styled.div`
  color: #999;
  margin-bottom: 15px;
`;
const Card = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
`;
const CardHeading = styled.div`
  color: ${theme.cardHeaderColor};
`;
const CardInfo = styled.div`
  font-weight: 500;
`;

export const Home: React.FC<RouteComponentProps> = () => {
  const [summary, setSummary] = useState(null);
  const [nextAppointment, setNextAppointment] = useState(null);

  useEffect(() => {
    getDailyInfo().then((results) => {
      setSummary(results.summary);
      setNextAppointment(results.nextAppointment);
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
          <Card>
            <CardHeading>Date and time</CardHeading>
            <CardInfo>{format(new Date(), 'yyyy/MM/dd')}</CardInfo>
            <CardHeading>Address</CardHeading>
            <CardInfo>15 Main St</CardInfo>
            <CardInfo>East Hampton, NY 11930</CardInfo>
          </Card>
        </>
      )}
    </div>
  );
};
