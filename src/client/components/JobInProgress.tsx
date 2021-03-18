import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { AppointmentAttributes } from '../../models/appointment.model';
import { Button } from '../elements/Button';
import { Card } from '../elements/Card';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';
import { useInterval } from '../useInterval';

const Header = styled.div`
  align-items: center;
  color: ${theme.passiveLinkColor};
  display: inline-block;
  display: flex;
  margin-bottom: 10px;
  width: 200px;
  span {
    font-size: 1.5em;
    margin-right: 5px;
  }
`;

const Label = styled.label`
  color: ${theme.subheaderTextColor};
  display: block;
  margin-top: 30px;
  margin-bottom: 10px;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 400px;
  resize: none;
  background-color: ${theme.inputBackgroundColor};
  margin-bottom: 20px;
  border-radius: 10px;
  border: none;
  padding: 20px;
  box-sizing: border-box;
`;

type JobInProgressProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
};

export const JobInProgress: React.FC<JobInProgressProps> = ({
  appointment,
}) => {
  // todo(hacky)
  const start = new Date(appointment.started_at || Date.now());
  const now = new Date();
  const [secondsLogged, setSecondsLogged] = useState<number>(
    Math.abs(DateTimeHelper.differenceInSeconds(start, now)),
  );

  useInterval(() => {
    setSecondsLogged(secondsLogged + 1);
  }, 1000);

  const minutes = Math.floor(secondsLogged / 60);
  let seconds = (secondsLogged % 60).toString();
  if (seconds.length === 1) {
    seconds = '0' + seconds;
  }

  return (
    <div>
      <Card>
        <Header>
          <span>
            <Icon name="Time-Circle" />
          </span>
          Time
        </Header>
        <div>
          {minutes}:{seconds}
        </div>
      </Card>
      <Label>Notes</Label>
      <Textarea />
      <Button>Conclude Appointment</Button>
    </div>
  );
};
