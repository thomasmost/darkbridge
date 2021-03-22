import styled from '@emotion/styled';
import { Link } from '@reach/router';
import { format } from 'date-fns';
import React from 'react';
import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentStatus } from '../../shared/enums';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';

type AppointmentCardProps = {
  appointment: AppointmentAttributes;
  interactive?: boolean;
};

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

const Block = styled.div`
  background-color: ${theme.blockColorDefault};
  border-bottom: 1px solid white;
  padding: 20px;
`;

export const AppointmentListItem: React.FC<AppointmentCardProps> = ({
  appointment,
}) => {
  let statusBadge: JSX.Element | null = null;
  let blockColor = theme.blockColorDefault;
  let textColor = theme.passiveLinkColor;
  const Badge = styled.div`
    padding: 5px 0;
    color: ${theme.textColor};
    border-radius: 20px;
    display: block;
    line-height: 40px;
    padding: 0 20px;
    max-height: 40px;
  `;

  switch (appointment.status) {
    case AppointmentStatus.completed: {
      blockColor = theme.blockColorInactive;
      textColor = theme.subheaderTextColor;
      statusBadge = <Badge>Completed</Badge>;
      break;
    }
    case AppointmentStatus.in_progress: {
      blockColor = theme.blockColorActive;
      textColor = theme.activeLinkColor;
      statusBadge = <Badge>In Progress</Badge>;
      break;
    }
    case AppointmentStatus.canceled: {
      // blockColor = theme.blockColorWarning;
      break;
    }
  }
  const Block = styled.div`
    background-color: ${blockColor};
    color: ${textColor};
    border-bottom: 1px solid white;
    padding: 20px;
  `;
  // const userOffset = new Date().getTimezoneOffset();
  // const showTimezone = userOffset !== appointment.timezone_offset;
  return (
    <Block>
      <BlockSection>
        <div style={{ color: theme.textColor }}>{appointment.summary}</div>
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
        <div style={{ display: 'flex' }}>
          {statusBadge}
          <StyledLink to={`/appointment/${appointment.id}`}>Details</StyledLink>
        </div>
      </BlockSection>
    </Block>
  );
};
