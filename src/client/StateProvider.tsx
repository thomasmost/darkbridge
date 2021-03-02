import React, { useReducer } from 'react';
import {
  DispatchContext,
  reducer,
  StateContainer,
  StateContext,
} from './reducers';

export const StateProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, new StateContainer());
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};
