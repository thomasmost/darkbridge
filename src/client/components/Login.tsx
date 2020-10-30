import React, { useRef } from 'react';
import { useAuth } from '../AuthProvider';

import { Link, RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { clientTokenStore } from '../clientTokenStore';
import { AccountForm } from '../elements/AccountForm';
import { FormFieldPair } from '../elements/FormFieldPair';

const FormHeader = styled.h2`
  font-weight: 600;
`;

export const Login: React.FC<RouteComponentProps> = () => {
  const userEmail = useRef<HTMLInputElement>(null);
  const userPassword = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  async function loginUser(email: string, password: string) {
    const result = await fetch('/.netlify/functions/api?auth=login', {
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
    const data = (await result.json()) as { token: string; user: any };
    login(data.user);
    clientTokenStore.set(data.token);
  }

  function onSubmit() {
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
