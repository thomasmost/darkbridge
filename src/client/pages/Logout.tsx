import React, { useEffect, useState } from 'react';

import { Link, RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { clientTokenStore } from '../clientTokenStore';

const FormHeader = styled.h2`
  font-weight: 600;
`;

export const Logout: React.FC<RouteComponentProps> = () => {
  const [sessionCleared, setSessionCleared] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/logout');
    clientTokenStore.clear();
    setSessionCleared(true);
  });

  return (
    <div>
      {sessionCleared && <FormHeader>You are now logged out.</FormHeader>}
      <Link to="/home">Go Home</Link>
    </div>
  );
};
