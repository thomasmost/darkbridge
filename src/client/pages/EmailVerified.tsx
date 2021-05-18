import React from 'react';

import { Link, RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { AccountForm } from '../elements/AccountForm';
import { theme } from '../theme';

const Logo = styled.img`
  display: block;
  margin: auto;
  margin-top: 40px;
  margin-bottom: 60px;
`;

const FormHeader = styled.h2`
  color: white;
  display: block;
  font-size: 1.6em;
  font-weight: 600;
  margin-bottom: 30px;
  margin-top: 20px;
`;

const Instruction = styled.p`
  color: ${theme.darkModeTextColor};
`;

export const EmailVerified: React.FC<RouteComponentProps> = () => {
  return (
    <AccountForm autoComplete="disabled">
      <Logo height="64px" src="/logo_light.svg" />
      <FormHeader>
        Thanks! Your email has been successfully verified.
      </FormHeader>
      <Instruction>
        <Link to="/login">
          <b>Log in</b>
        </Link>
      </Instruction>
    </AccountForm>
  );
};
