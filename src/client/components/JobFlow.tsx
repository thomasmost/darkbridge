import React, { useContext, useEffect } from 'react';
import { RouteComponentProps, Router, useNavigate } from '@reach/router';
import { queryAppointments } from '../services/appointment.svc';
import { DispatchContext, StateContext } from '../reducers';
import { JobInProgress } from './JobInProgress';
import styled from '@emotion/styled';
import { theme } from '../theme';

const HeadingText = styled.h2`
  margin-bottom: 20px;
  font-size: 1.6em;
  color: ${theme.pageHeaderColor};
`;

export const JobFlow: React.FC<
  RouteComponentProps<{ appointment_id: string }>
> = (props) => {
  const { appointments } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const navigate = useNavigate();

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
    // the additional 'noop' id is a hack to satisfy the swagger validation
    queryAppointments({ ids: [appointment_id, 'noop'] }).then((result) => {
      if (result.error) {
        return;
      }
      dispatch({ type: 'SET_APPOINTMENTS', data: result.data });
    });
  }, []);

  if (!currentAppointment) {
    return null;
  }
  if (currentAppointment.status !== 'in_progress') {
    navigate(`/appointment/${currentAppointment.id}`);
    return null;
  }
  return (
    <div>
      <HeadingText>{currentAppointment.summary}</HeadingText>
      <Router>
        <JobInProgress appointment={currentAppointment} path="working" />
      </Router>
    </div>
  );
};
