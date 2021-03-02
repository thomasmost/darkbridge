import styled from '@emotion/styled';
import { Link, RouteComponentProps } from '@reach/router';
import React, { useContext } from 'react';
import { AppointmentListItem } from '../components/AppointmentListItem';
import { FlexColumns } from '../elements/FlexColumns';
import { Icon } from '../elements/Icon';
import { StateContext } from '../reducers';
import { theme } from '../theme';

const StyledLink = styled(Link)`
  color: ${theme.buttonColorActive};
  text-decoration: none;
  font-size: 2em;
`;

export const Calendar: React.FC<RouteComponentProps> = () => {
  const { appointments } = useContext(StateContext);
  return (
    <div>
      <FlexColumns>
        <div>List view</div>
        <StyledLink to="add-appointment">
          <Icon name="Plus" />
        </StyledLink>
      </FlexColumns>
      {appointments.map((appointment) => (
        <AppointmentListItem key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
};
