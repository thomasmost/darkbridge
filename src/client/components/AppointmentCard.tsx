import styled from '@emotion/styled';
import { format } from 'date-fns';
import React from 'react';
import { AppointmentAttributes } from '../../models/appointment.model';
import { Card } from '../elements/Card';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';

type AppointmentCardProps = {
  appointment: AppointmentAttributes;
  interactive?: boolean;
  warning?: boolean;
};

const CardHeading = styled.div`
  display: flex;
  align-items: center;
  color: ${theme.cardHeaderColor};
  margin-bottom: 5px;
`;
const CardArrow = styled.div`
  width: 20px;
  max-width: 20px;
  font-size: 32px;
  color: ${theme.buttonColorActive};
`;

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  interactive,
  warning,
}) => {
  const StyledCard = styled(Card)`
    cursor: ${interactive ? 'pointer' : 'default'};
    display: flex;
    justify-content: space-between;
  `;

  const CardInfo = styled.div`
    margin-left: 40px;
    font-weight: 500;
    line-height: 1.5em;
    color: ${warning ? theme.warningColor : theme.textColor};
  `;

  const userOffset = new Date().getTimezoneOffset();
  const showTimezone = userOffset !== appointment.timezone_offset;
  return (
    <StyledCard>
      <div>
        <div style={{ marginBottom: '20px' }}>
          <CardHeading>
            <span
              style={{
                fontSize: '1.5em',
                display: 'inline-block',
                width: '40px',
              }}
            >
              <Icon name="Calendar" />
            </span>
            Date and time
          </CardHeading>
          <CardInfo>
            {format(new Date(appointment.datetime_local), 'yyyy/MM/dd h:mm')}—
            {format(new Date(appointment.datetime_end_local), 'h:mm a')}{' '}
            {showTimezone && `(${appointment.timezone_friendly})`}
          </CardInfo>
        </div>
        <div>
          <CardHeading>
            <span
              style={{
                fontSize: '1.5em',
                display: 'inline-block',
                width: '40px',
              }}
            >
              <Icon name="Location" />
            </span>
            Address
          </CardHeading>
          <CardInfo>{appointment.address_street}</CardInfo>
          <CardInfo>
            {appointment.address_city}, {appointment.address_state}{' '}
            {appointment.address_postal_code}
          </CardInfo>
        </div>
      </div>
      {Boolean(interactive) && (
        <CardArrow>
          <Icon name="Arrow-Right-2" />
        </CardArrow>
      )}
    </StyledCard>
  );
};
