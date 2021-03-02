import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';

import { getDailyInfo } from '../services/appointment.svc';
import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentView } from '../components/AppointmentView';

export const NextAppointment: React.FC<RouteComponentProps> = () => {
  const [
    nextAppointment,
    setNextAppointment,
  ] = useState<AppointmentAttributes | null>(null);

  useEffect(() => {
    getDailyInfo().then((result) => {
      if (result.error) {
        return;
      }
      setNextAppointment(result.data.nextAppointment);
    });
  }, []);

  if (!nextAppointment) {
    return null;
  }

  return (
    <AppointmentView appointment={nextAppointment} header="Next appointment" />
  );
};
