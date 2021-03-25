import React from 'react';
import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentStatus } from '../../shared/enums';

import produce from 'immer';

export interface IStateContainer {
  appointments: AppointmentAttributes[];
}
export interface IImmutableStateContainer {
  readonly appointments: Readonly<Readonly<AppointmentAttributes>[]>;
}

export const newStateContainer = () => ({ appointments: [] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Action<T = any> {
  type: string;
  data: T;
}

export const StateContext = React.createContext<IImmutableStateContainer>(
  newStateContainer() as IImmutableStateContainer,
);
export const DispatchContext = React.createContext<React.Dispatch<Action>>(
  () => null,
);

// eslint-disable-next-line sonarjs/cognitive-complexity
const immerReducer = (draft: IStateContainer, action: Action): void => {
  if (action.type === 'SET_APPOINTMENTS') {
    draft.appointments = action.data;
  }
  if (action.type === 'START_APPOINTMENT') {
    const { appointment_id } = action.data;
    for (const appointment of draft.appointments) {
      if (appointment.id === appointment_id) {
        appointment.status = AppointmentStatus.in_progress;
      }
    }
  }
  if (action.type === 'COMPLETE_APPOINTMENT') {
    const { appointment_id } = action.data;
    for (const appointment of draft.appointments) {
      if (appointment.id === appointment_id) {
        appointment.status = AppointmentStatus.completed;
      }
    }
  }
  if (action.type === 'RESCHEDULE_APPOINTMENT_SUCCESS') {
    const newAppointment = action.data;
    for (let i = 0; i < draft.appointments.length; i++) {
      if (draft.appointments[i].id === newAppointment.id) {
        draft.appointments[i] = newAppointment;
      }
    }
  }
};

export const reducer = produce(immerReducer);
