import React, { useState, useEffect, useMemo } from 'react';
import { useAuthFactory, IAuthContext } from './useAuth';
import { IUserDto, UserUpdateFields } from '../shared/user.dto';

const unauthorizedRoutes = ['/', '/login', '/register'];

function getCurrentUser() {
  return fetch('/api/auth/current_user', {}).then(function (response) {
    if (
      response.status === 401 &&
      !unauthorizedRoutes.includes(window.location.pathname)
    ) {
      window.location.replace('/login');
      return;
    }
    return response.json();
  });
}

const AuthContext = React.createContext<IAuthContext>({
  user: null,
  login: () => null,
  logout: () => null,
  updateUser: () => null,
});

export const useAuth = useAuthFactory<IAuthContext>(AuthContext);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<IUserDto | null>(null);

  useEffect(() => {
    getCurrentUser().then(login);
  }, []);

  const login = async (user: IUserDto) => {
    setUser(user);
  };

  const logout = async () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<UserUpdateFields>) => {
    if (user) {
      setUser({
        ...user,
        ...updates,
      });
    }
  };

  const value = useMemo(() => {
    return {
      login,
      logout,
      updateUser,
      user,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
