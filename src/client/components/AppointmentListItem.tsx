import styled from '@emotion/styled';
import { Link } from '@reach/router';
import { format } from 'date-fns';
import React from 'react';
import { AppointmentAttributes } from '../../models/appointment.model';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';

type AppointmentCardProps = {
  appointment: AppointmentAttributes;
  interactive?: boolean;
};

const Block = styled.div`
  background-color: #daedfd;
  border-bottom: 1px solid white;
  padding: 20px;
`;

const BlockSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

const Time = styled.div`
  color: ${theme.passiveLinkColor};
  display: flex;
  align-items: center;
  *:first-of-type {
    margin-right: 5px;
    font-size: 1.1em;
    top: 1px;
    position: relative;
  }
`;
const Address = styled.div`
  color: ${theme.passiveLinkColor};
  font-size: 1.2em;
  div {
    margin-bottom: 5px;
  }
`;

const StyledLink = styled(Link)`
  background-color: white;
  color: ${theme.buttonColorActive};
  border-radius: 20px;
  display: block;
  line-height: 40px;
  padding: 0 20px;
  max-height: 40px;
`;

export const AppointmentListItem: React.FC<AppointmentCardProps> = ({
  appointment,
}) => {
  // const userOffset = new Date().getTimezoneOffset();
  // const showTimezone = userOffset !== appointment.timezone_offset;
  return (
    <Block>
      <BlockSection>
        <div>{appointment.summary}</div>
        <Time>
          <Icon name="Time-Circle" />
          {format(new Date(appointment.datetime_local), 'h:mma')}
        </Time>
      </BlockSection>
      <BlockSection>
        <Address>
          <div>{appointment.address_street}</div>
          <div>{appointment.address_city}</div>
          <div>
            {appointment.address_state} {appointment.address_postal_code}
          </div>
        </Address>
        <StyledLink to={`/appointment/${appointment.id}`}>Details</StyledLink>
      </BlockSection>
    </Block>
  );
};
