import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { AppointmentAttributes } from '../../models/appointment.model';

type JobInProgressProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
};

export const JobInProgress: React.FC<JobInProgressProps> = ({
  appointment,
}) => {
  const start = new Date(appointment.datetime_utc);
  const now = new Date();
  const [minutesLogged, setMinutesLogged] = useState<number>(
    Math.abs(DateTimeHelper.differenceInMinutes(start, now)),
  );

  useEffect(() => {
    setInterval(() => {
      setMinutesLogged(minutesLogged + 1);
    }, 1000);
  }, []);

  return <div>{minutesLogged} minutes</div>;
};
