import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import { theme } from '../theme';

const Section = styled.div`
  margin-top: 20px;
  span {
    font-weight: 600;
    color: ${theme.headerTextColor};
  }
`;

const Button = styled.button`
  cursor: pointer;
  margin-right: 10px;
`;

const standardRequestHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export const ApiSandbox: React.FC<RouteComponentProps> = () => {
  const [sampleVariable, setSampleVariable] = useState<string>('');

  const getSecretVar = async () => {
    const response = await fetch(`/api/get_secret_var`, {
      headers: standardRequestHeaders,
    });

    const result = await response.json();
    setSampleVariable(result.var);
  };

  const getPublicVar = async () => {
    const response = await fetch(`/api/get_public_var`, {
      headers: standardRequestHeaders,
    });

    const result = await response.json();
    setSampleVariable(result.var);
  };

  return (
    <>
      <div>
        <Section>
          <Button onClick={getSecretVar}>Get Secret Variable</Button>
          <Button onClick={getPublicVar}>Get Node Env</Button>
        </Section>
      </div>
      <Section>
        Example Environment Variable: <span>{sampleVariable}</span>
      </Section>
    </>
  );
};
