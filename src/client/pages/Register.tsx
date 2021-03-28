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
    return data.user;
  } catch (err) {
    toast.error('Registration failed');
  }
}

export const Register: React.FC<RouteComponentProps> = () => {
  const userEmail = useRef<HTMLInputElement>(null);
  const userPassword = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      // navigate('/');
      location.assign('/onboarding');
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
      <Logo height="64px" src="/logo_light.svg" />
      <FormHeader>Register</FormHeader>
      <Instruction>
        Already have an account?{' '}
        <Link to="/login">
          <b>Log in</b>
        </Link>
      </Instruction>{' '}
      <FormFieldPair>
        <p>Email</p>
        <Input
          type="email"
          name="userEmail"
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
          placeholder="••••••••"
          required
          ref={userPassword}
        />
      </FormFieldPair>
      <FormFieldPair>
        <p>Confirm Password</p>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          required
          ref={confirmPasswordRef}
        />
      </FormFieldPair>
      <Input type="submit" value="Register" />
      <Instruction>
        By registering, you agree to our{' '}
        <a
          href="https://www.callteddy.com/terms-of-service"
          target="_blank"
          rel="noreferrer"
        >
          Terms of Service
        </a>{' '}
        and confirm that you&apos;ve read our{' '}
        <a
          href="https://www.callteddy.com/privacy-policy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </a>
        .
      </Instruction>{' '}
    </AccountForm>
  );
};
