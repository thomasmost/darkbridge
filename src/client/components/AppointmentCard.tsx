import styled from '@emotion/styled';
import { format } from 'date-fns';
import React from 'react';
import { AppointmentAttributes } from '../../models/appointment.model';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';

type AppointmentCardProps = {
  appointment: AppointmentAttributes;
  interactive?: boolean;
};

const CardHeading = styled.div`
  display: flex;
  align-items: center;
  color: ${theme.cardHeaderColor};
  margin-bottom: 5px;
`;
const CardInfo = styled.div`
  margin-left: 40px;
  font-weight: 500;
  line-height: 1.5em;
  color: ${theme.textColor};
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
}) => {
  const Card = styled.div`
    align-items: center;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 20px 20px ${theme.boxShadowColor};
    cursor: ${interactive ? 'pointer' : 'default'};
    display: flex;
    justify-content: space-between;
    padding: 20px;
  `;

  const userOffset = new Date().getTimezoneOffset();
  const showTimezone = userOffset !== appointment.timezone_offset;
  return (
    <Card>
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
    </Card>
  );
};
