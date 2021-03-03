import styled from '@emotion/styled';
import { Link, RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect } from 'react';
import { AppointmentListItem } from '../components/AppointmentListItem';
import { FlexColumns } from '../elements/FlexColumns';
import { Icon } from '../elements/Icon';
import { DispatchContext, StateContext } from '../reducers';
import { getDailyInfo } from '../services/appointment.svc';
import { theme } from '../theme';

const StyledLink = styled(Link)`
  color: ${theme.buttonColorActive};
  font-size: 2em;
`;

const Spacer = styled.div`
  height: 20px;
  width: 100%;
`;

export const Calendar: React.FC<RouteComponentProps> = () => {
  const { appointments } = useContext(StateContext);

  const dispatch = useContext(DispatchContext);

  useEffect(() => {
    // Always refresh day's appointments
    // in the future we shouldq query for a range
    getDailyInfo().then((result) => {
      if (result.error) {
        return;
      }
      dispatch({ type: 'SET_APPOINTMENTS', data: result.data.appointments });
    });
  }, []);

  return (
    <div>
      <FlexColumns>
        <div>List view</div>
        <StyledLink to="add-appointment">
          <Icon name="Plus" />
        </StyledLink>
      </FlexColumns>
      <Spacer />
      {appointments.map((appointment) => (
        <AppointmentListItem key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
};
