import { RouteComponentProps } from '@reach/router';
import React, { useContext } from 'react';

import { AppointmentView } from '../components/AppointmentView';
import { StateContext } from '../reducers';

export const AppointmentScreen: React.FC<
  RouteComponentProps<{ appointment_id: string }>
> = (props) => {
  const { appointments } = useContext(StateContext);
  const { appointment_id } = props;

  const currentAppointment = appointments.find(
    (appointment) => appointment.id === appointment_id,
  );

  if (!currentAppointment) {
    return null;
  }

  return (
    <AppointmentView
      appointment={currentAppointment}
      header={currentAppointment.summary}
    />
  );
};
