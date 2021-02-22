import React, { useState } from 'react';

import { RouteComponentProps } from '@reach/router';
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

export const RequestPasswordReset: React.FC<RouteComponentProps> = () => {
  const { handleSubmit, register } = useForm<{ email: string }>();
  const [success, setSuccess] = useState<boolean>(false);

  async function submit(values: { email: string }) {
    const { email } = values;
    try {
      const response = await fetch('/api/auth/request_password_reset', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          email,
        }),
      });
      if (response.status !== 204) {
        const error = await response.text();
        toast.error(error);
        return;
      }
      setSuccess(true);
    } catch (err) {
      toast.error('Request failed');
    }
  }

  if (success) {
    return (
      <AccountForm autoComplete="disabled" onSubmit={handleSubmit(submit)}>
        <Logo height="64px" src="/logo_light.png" />
        <FormHeader>Request Submitted!</FormHeader>
        <Instruction>Check your email for instructions!</Instruction>
      </AccountForm>
    );
  }

  return (
    <AccountForm autoComplete="disabled" onSubmit={handleSubmit(submit)}>
      <Logo height="64px" src="/logo_light.png" />
      <FormHeader>Request Password Reset</FormHeader>
      <Instruction>
        Enter your email and we&apos;ll send you a link to change your password.
      </Instruction>
      <FormFieldPair>
        <p>Email</p>
        <Input
          type="email"
          name="email"
          autoComplete="off"
          placeholder="teddy@callteddy.com"
          ref={register({ required: true })}
        />
      </FormFieldPair>
      <p />
      <Input type="submit" value="Submit" />
    </AccountForm>
  );
};
