import React, { useReducer } from 'react';
import {
  DispatchContext,
  IImmutableStateContainer,
  reducer,
  newStateContainer,
  StateContext,
} from './reducers';

export const StateProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(
    reducer,
    newStateContainer() as IImmutableStateContainer,
  );
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
};
