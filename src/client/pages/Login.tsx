import React, { useEffect, useRef } from 'react';
import { useAuth } from '../AuthProvider';

import { Link, RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { AccountForm } from '../elements/AccountForm';
import { FormFieldPair } from '../elements/FormFieldPair';
import { IUserDto } from '../../shared/user.dto';
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

const Input = styled.input`
  font-size: 1em;
`;

export const Login: React.FC<RouteComponentProps> = () => {
  const userEmail = useRef<HTMLInputElement>(null);
  const userPassword = useRef<HTMLInputElement>(null);
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      // navigate('/');
      location.assign('/');
    }
  });

  async function loginUser(email: string, password: string) {
    try {
      const result = await fetch('/api/auth/login', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await result.json()) as { token: string; user: IUserDto };
      login(data.user);
    } catch (err) {
      toast.error('Login failed');
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = userEmail.current?.value;
    const password = userPassword.current?.value;
    if (!email || !password) {
      toast.error('Please provide both a username and a password');
      return;
    }
    return loginUser(email, password);
  }

  return (
    <AccountForm autoComplete="disabled" onSubmit={onSubmit}>
      <Logo height="64px" src="/logo_light.png" />
      <FormHeader>Log In</FormHeader>
      <Instruction>
        Don&apos;t have an account?{' '}
        <Link to="/register">
          <b>Sign up</b>
        </Link>
      </Instruction>
      <FormFieldPair>
        <p>Email</p>
        <Input
          type="email"
          name="userEmail"
          autoComplete="off"
          placeholder="teddy@callteddy.com"
          required
          ref={userEmail}
        />
      </FormFieldPair>
      <FormFieldPair>
        <p>Password</p>
        <Input
          type="password"
          name="userPassword"
          autoComplete="off"
          placeholder="••••••••"
          required
          ref={userPassword}
        />
      </FormFieldPair>
      <p />
      <Input type="submit" value="Log In" />
      <p>
        <Link to="/request_password_reset">
          Click here to <b>reset password.</b>
        </Link>
      </p>
    </AccountForm>
  );
};
