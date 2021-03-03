import React from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { AccountForm } from '../elements/AccountForm';
import { FormFieldPair } from '../elements/FormFieldPair';
import { theme } from '../theme';
import { useForm } from 'react-hook-form';

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

export const ResetPassword: React.FC<RouteComponentProps<{ token: string }>> = (
  props,
) => {
  const { handleSubmit, register } = useForm<{
    password: string;
    confirm_password: string;
  }>();
  const navigate = useNavigate();
  const { token } = props;

  async function submit(values: {
    password: string;
    confirm_password: string;
  }) {
    const { password, confirm_password } = values;
    try {
      const response = await fetch('/api/auth/verify_password_reset', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          password,
          confirm_password,
          token,
        }),
      });
      if (response.status !== 204) {
        const error = await response.text();
        toast.error(error);
        return;
      }
      toast.success('Password successfully reset!');
      navigate('/login');
    } catch (err) {
      toast.error('Request failed');
    }
  }

  return (
    <AccountForm autoComplete="disabled" onSubmit={handleSubmit(submit)}>
      <Logo height="64px" src="/logo_light.svg" />
      <FormHeader>Request Password Reset</FormHeader>
      <Instruction>
        Enter your email and we&apos;ll send you a link to change your password.
      </Instruction>
      <FormFieldPair>
        <p>Password</p>
        <Input
          type="password"
          name="password"
          placeholder="••••••••"
          required
          ref={register({ required: true })}
        />
      </FormFieldPair>
      <FormFieldPair>
        <p>Confirm Password</p>
        <Input
          type="password"
          name="confirm_password"
          placeholder="••••••••"
          required
          ref={register({ required: true })}
        />
      </FormFieldPair>
      <p />
      <Input type="submit" value="Submit" />
    </AccountForm>
  );
};
