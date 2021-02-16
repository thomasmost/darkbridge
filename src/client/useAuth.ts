import { useContext } from 'react';
import React from 'react';
import { IUserDto, UserUpdateFields } from '../shared/user.dto';

export interface IAuthContext {
  user: IUserDto | null;
  login: (user: IUserDto) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserUpdateFields>) => void;
}

const throwError = () => {
  throw new Error('useAuth must be a child of AuthProvider');
};

export const useAuthFactory = <T>(AuthContext: React.Context<T>) => () =>
  useContext(AuthContext) || throwError();
