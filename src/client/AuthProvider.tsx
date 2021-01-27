import React, { useState, useEffect, useMemo } from 'react';
import { useAuthFactory, IAuthContext } from './useAuth';
import { IUserDto } from '../shared/user.dto';
import { clientTokenStore } from './clientTokenStore';

function getCurrentUser() {
  const token = clientTokenStore.get();
  return fetch('/api/current_user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(function (response) {
    if (response.status === 401) {
      clientTokenStore.clear();
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
  // updateUser: () => null,
});

export const useAuth = useAuthFactory<IAuthContext>(AuthContext);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<IUserDto | null>(null);

  const token = clientTokenStore.get();

  useEffect(() => {
    if (token) {
      getCurrentUser().then(login);
    } else if (window.location.pathname === '/') {
      window.location.replace('/login');
    }
  }, [token]);

  const login = async (user: IUserDto) => {
    setUser(user);
  };

  const logout = async () => {
    setUser(null);
    clientTokenStore.clear();
  };

  const value = useMemo(() => {
    return {
      login,
      logout,
      // updateUser,
      user,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
