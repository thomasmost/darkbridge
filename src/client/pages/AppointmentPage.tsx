import { RouteComponentProps } from '@reach/router';
import React, { useContext, useEffect } from 'react';

import { AppointmentView } from '../components/AppointmentView';
import { DispatchContext, StateContext } from '../reducers';
import { queryAppointments } from '../services/appointment.svc';

export const AppointmentPage: React.FC<
  RouteComponentProps<{ appointment_id: string }>
> = (props) => {
  const { appointments } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const { appointment_id } = props;

  const currentAppointment = appointments?.find(
    (appointment) => appointment.id === appointment_id,
  );

  useEffect(() => {
    if (!appointment_id) {
      return;
    }
    if (currentAppointment) {
      return;
    }
    queryAppointments({ ids: [appointment_id, 'foo'] }).then((result) => {
      if (result.error) {
        return;
      }
      dispatch({ type: 'SET_APPOINTMENTS', data: result.data });
    });
  }, []);

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
