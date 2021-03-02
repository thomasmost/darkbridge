import React from 'react';
import { AppointmentAttributes } from '../../models/appointment.model';

export interface IStateContainer {
  appointments: AppointmentAttributes[];
}

export class StateContainer implements IStateContainer {
  public appointments: AppointmentAttributes[];
  constructor() {
    this.appointments = [];
  }
}

export interface Action<T> {
  type: string;
  data: T;
}

export const StateContext = React.createContext(new StateContainer());
export const DispatchContext = React.createContext<React.Dispatch<Action<any>>>(
  () => null,
);

export const reducer = (
  state: StateContainer,
  action: Action<any>,
): StateContainer => {
  if (action.type === 'SET_APPOINTMENTS') {
    return {
      ...state,
      appointments: action.data,
    };
  }
  return state;
};
