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

export const Register: React.FC<RouteComponentProps> = () => {
  const userEmail = useRef<HTMLInputElement>(null);
  const userPassword = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  async function registerUser(
    given_name: string,
    family_name: string,
    email: string,
    password: string,
    confirm_password: string,
  ) {
    const result = await fetch('api/register', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        given_name,
        family_name,
        email,
        password,
        confirm_password,
      }),
    });
    const data = (await result.json()) as { token: string; user: any };
    login(data.user);
    clientTokenStore.set(data.token);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = userEmail.current?.value;
    const password = userPassword.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill out all fields');
      return;
    }
    return registerUser(
      'Jonathan',
      'Strange',
      email,
      password,
      confirmPassword,
    );
  }

  return (
    <AccountForm autoComplete="disabled" onSubmit={onSubmit}>
      <FormHeader>Register</FormHeader>
      <p>
        Already have an account?{' '}
        <Link to="/login">
          <b>Log in!</b>
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
      <FormFieldPair>
        <p>Confirm Password</p>
        <input
          type="password"
          name="confirmPassword"
          autoComplete="off"
          placeholder="Confirm Password"
          required
          ref={confirmPasswordRef}
        />
      </FormFieldPair>
      <input type="submit" value="Register" />
    </AccountForm>
  );
};
