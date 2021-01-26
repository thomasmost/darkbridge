import React, { useEffect, useRef } from 'react';
import { useAuth } from '../AuthProvider';

import { Link, RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { clientTokenStore } from '../clientTokenStore';
import { AccountForm } from '../elements/AccountForm';
import { FormFieldPair } from '../elements/FormFieldPair';
import { FlexColumns } from '../elements/FlexColumns';

const FormHeader = styled.h2`
  font-weight: 600;
`;

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
  clientTokenStore.set(data.token);
  return data.user;
}

export const Register: React.FC<RouteComponentProps> = () => {
  const userGivenName = useRef<HTMLInputElement>(null);
  const userFamilyName = useRef<HTMLInputElement>(null);
  const userEmail = useRef<HTMLInputElement>(null);
  const userHandle = useRef<HTMLInputElement>(null);
  const userPassword = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
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
    const user = await registerUser(
      userGivenName.current?.value || 'First',
      userGivenName.current?.value || 'Last',
      email,
      password,
      confirmPassword,
    );
    login(user);
  }

  return (
    <AccountForm autoComplete="disabled" onSubmit={onSubmit}>
      <FormHeader>Register</FormHeader>
      <p>
        Already have an account?{' '}
        <Link to="/login">
          <b>Log in!</b>
        </Link>
      </p>{' '}
      <FlexColumns>
        <FormFieldPair>
          <p>Given Name</p>
          <input
            name="givenName"
            placeholder="Your first or given name"
            ref={userGivenName}
          />
        </FormFieldPair>
        <FormFieldPair>
          <p>Family Name</p>
          <input
            name="familyName"
            placeholder="Your last or family name"
            ref={userFamilyName}
          />
        </FormFieldPair>
      </FlexColumns>
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
        <p>Handle</p>
        <input
          placeholder="Enter your preferred username or handle"
          ref={userHandle}
        />
      </FormFieldPair>
      <FlexColumns>
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
      </FlexColumns>
      <input type="submit" value="Register" />
    </AccountForm>
  );
};
