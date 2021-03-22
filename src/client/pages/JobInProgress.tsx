import styled from '@emotion/styled';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { AppointmentAttributes } from '../../models/appointment.model';
import { TimeCard } from '../components/TimeCard';
import { Button } from '../elements/Button';
import { Label } from '../elements/Label';
import { apiRequest } from '../services/api.svc';
import { theme } from '../theme';
import { useInterval } from '../useInterval';

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

type FormValues = {
  notes: string;
};

export const JobInProgress: React.FC<JobInProgressProps> = ({
  appointment,
}) => {
  // todo(hacky)
  const { register, handleSubmit } = useForm<FormValues>();
  const navigate = useNavigate();
  const start = new Date(appointment.started_at || Date.now());
  const now = new Date();
  const [secondsLogged, setSecondsLogged] = useState<number>(
    Math.abs(DateTimeHelper.differenceInSeconds(start, now)),
  );

  useInterval(() => {
    setSecondsLogged(secondsLogged + 1);
  }, 1000);

  const onSubmit = async (values: FormValues) => {
    const { error } = await apiRequest(
      `appointment/${appointment.id}/complete`,
      'text',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify(values),
      },
    );
    if (!error) {
      navigate(`/job/${appointment.id}/invoice`);
    }
  };

  return (
    <div>
      <TimeCard secondsLogged={secondsLogged} />
      <Label>Notes</Label>
      {/* <form onSubmit={handleSubmit(onSubmit)}> */}
      <Textarea ref={register} />
      <Button onClick={handleSubmit(onSubmit)}>Conclude Appointment</Button>
      {/* </form> */}
    </div>
  );
};
