import React, { useEffect, useRef } from 'react';
import { useAuth } from '../AuthProvider';

import { Link, RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { clientTokenStore } from '../clientTokenStore';
import { AccountForm } from '../elements/AccountForm';
import { FormFieldPair } from '../elements/FormFieldPair';
import { IUserDto } from '../../shared/user.dto';

const FormHeader = styled.h2`
  font-weight: 600;
`;

export const Login: React.FC<RouteComponentProps> = () => {
  const userEmail = useRef<HTMLInputElement>(null);
  const userPassword = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  });

  async function loginUser(email: string, password: string) {
    try {
      const result = await fetch('/api/login', {
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
      clientTokenStore.set(data.token);
      navigate('/');
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
      <FormHeader>Log In </FormHeader>
      <p>
        Don&apos;t have an account?{' '}
        <Link to="/register">
          <b>Sign up!</b>
        </Link>
      </p>
      <FormFieldPair>
        <p>Email</p>
        <input
          type="email"
          name="userEmail"
          autoComplete="off"
          placeholder="Please enter login email"
          required
          ref={userEmail}
        />
      </FormFieldPair>
      <FormFieldPair>
        <p>Password</p>
        <input
          type="password"
          name="userPassword"
          autoComplete="off"
          placeholder="Password"
          required
          ref={userPassword}
        />
      </FormFieldPair>
      <p />
      <input type="submit" value="Log In" />
      <p>
        <Link to="/resetpassword">
          Click here to <b>reset password.</b>
        </Link>
      </p>
    </AccountForm>
  );
};
