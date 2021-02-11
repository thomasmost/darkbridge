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

async function registerUser(
  email: string,
  password: string,
  confirm_password: string,
) {
  try {
    const result = await fetch('api/auth/register', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        confirm_password,
      }),
    });
    const data = (await result.json()) as { token: string; user: IUserDto };
    clientTokenStore.set(data.token);
    return data.user;
  } catch (err) {
    toast.error('Registration failed');
  }
}

export const Register: React.FC<RouteComponentProps> = () => {
  const userEmail = useRef<HTMLInputElement>(null);
  const userPassword = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      // navigate('/');
      location.assign('/');
    }
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = userEmail.current?.value;
    const password = userPassword.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill out all fields');
      return;
    }
    const user = await registerUser(email, password, confirmPassword);
    if (user) {
      login(user);
    }
  }

  return (
    <AccountForm autoComplete="disabled" onSubmit={onSubmit}>
      <FormHeader>Register</FormHeader>
      <p>
        Already have an account?{' '}
        <Link to="/login">
          <b>Log in</b>
        </Link>
      </p>{' '}
      <FormFieldPair>
        <p>Email</p>
        <input
          type="email"
          name="userEmail"
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
          placeholder="Confirm Password"
          required
          ref={confirmPasswordRef}
        />
      </FormFieldPair>
      <input type="submit" value="Register" />
    </AccountForm>
  );
};
