import React, { useEffect, useRef } from 'react';
import { useAuth } from '../AuthProvider';

import { Link, RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
// import { toast } from 'react-toastify';
import { clientTokenStore } from '../clientTokenStore';

const FormHeader = styled.h2`
  font-weight: 600;
`;

export const Logout: React.FC<RouteComponentProps> = () => {
  const userEmail = useRef<HTMLInputElement>(null);
  const userPassword = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  useEffect(() => {
    fetch('/api/logout');
    clientTokenStore.clear();
  });

  return (
    <div>
      <FormHeader>You are now logged out.</FormHeader>
      <Link to="/home">Go Home</Link>
    </div>
  );
};
