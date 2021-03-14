import React from 'react';
import {
  AppointmentAttributes,
  AppointmentStatus,
} from '../../models/appointment.model';

export interface IStateContainer {
  appointments: AppointmentAttributes[];
}

export class StateContainer implements IStateContainer {
  public appointments: AppointmentAttributes[];
  constructor() {
    this.appointments = [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Action<T = any> {
  type: string;
  data: T;
}

export const StateContext = React.createContext(new StateContainer());
export const DispatchContext = React.createContext<React.Dispatch<Action>>(
  () => null,
);

export const reducer = (
  state: StateContainer,
  action: Action,
): StateContainer => {
  if (action.type === 'SET_APPOINTMENTS') {
    return {
      ...state,
      appointments: action.data,
    };
  }
  if (action.type === 'START_APPOINTMENT') {
    const { appointment_id } = action.data;
    const newAppointments = [...state.appointments];
    for (const appointment of newAppointments) {
      if (appointment.id === appointment_id) {
        appointment.status = AppointmentStatus.in_progress;
      }
    }
    return {
      ...state,
      appointments: newAppointments,
    };
  }
  return state;
};
