import React from 'react';

import { Link, RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { AccountForm } from '../elements/AccountForm';
import { theme } from '../theme';
import { useAuth } from '../AuthProvider';
import { toast } from 'react-toastify';

const Logo = styled.img`
  display: block;
  margin: auto;
  margin-top: 40px;
  margin-bottom: 60px;
`;

const Instruction = styled.p`
  color: ${theme.darkModeTextColor};
  text-align: center;
`;

const FormHeader = styled.h2`
  color: white;
  display: block;
  font-size: 1.6em;
  font-weight: 600;
  margin-bottom: 30px;
  margin-top: 20px;
  text-align: center;
`;

export const EmailVerified: React.FC<RouteComponentProps> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    toast.success('Your email has been verified!');
    navigate('/');
    return null;
  }

  return (
    <AccountForm autoComplete="disabled">
      <Logo height="64px" src="/logo_light.svg" />
      <FormHeader>Your email has been verified.</FormHeader>
      <Instruction>
        Thanks for choosing Teddy!{' '}
        <Link to="/login">
          <b>Log in</b>
        </Link>{' '}
        to get started.
      </Instruction>
    </AccountForm>
  );
};
