import React, { useEffect } from 'react';

import { Link, RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { useAuth } from '../AuthProvider';

const FormHeader = styled.h2`
  font-weight: 600;
`;

export const Logout: React.FC<RouteComponentProps> = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    logout();
    fetch('/api/logout');
  }, []);

  return (
    <div>
      {!user && <FormHeader>You are now logged out.</FormHeader>}
      <Link to="/home">Go Home</Link>
    </div>
  );
};
