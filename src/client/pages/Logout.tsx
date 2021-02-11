import React, { useEffect } from 'react';

import { Link, RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { useAuth } from '../AuthProvider';

const FormHeader = styled.h2`
  font-weight: 600;
`;

async function handleLogout(logout: () => void) {
  await fetch('/api/auth/logout');
  logout();
  location.assign('/');
}

export const Logout: React.FC<RouteComponentProps> = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    handleLogout(logout);
  }, []);

  return (
    <div>
      {!user && <FormHeader>You are now logged out.</FormHeader>}
      <Link to="/home">Go Home</Link>
    </div>
  );
};
