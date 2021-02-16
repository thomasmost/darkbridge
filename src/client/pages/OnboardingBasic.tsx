import React from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import { H3, Label, OnboardingNav, P } from '../elements/OnboardingElements';
import { Input } from '../elements/Input';
import { useAuth } from '../AuthProvider';

const Logo = styled.img`
  display: block;
  margin: auto;
  margin-top: 40px;
  margin-bottom: 60px;
`;

type BasicFormFields = {
  full_name: string;
  phone: string;
  company_name: string;
};

export const OnboardingBasic: React.FC<RouteComponentProps> = () => {
  const { user, updateUser } = useAuth();
  if (!user) {
    return null;
  }
  const { register, handleSubmit } = useForm<BasicFormFields>();
  const navigate = useNavigate();

  const onSubmit = async (data: BasicFormFields) => {
    const { full_name, phone, company_name } = data;
    const nameParts = full_name.split(' ');
    const family_name = nameParts.pop();
    const given_name = nameParts.join(' ');
    const userUpdates = {
      family_name,
      given_name,
      phone,
    };
    await fetch('/api/user/self', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(userUpdates),
    });
    updateUser(userUpdates);
    if (company_name) {
      await fetch('/api/contractor_profile', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: JSON.stringify({
          company_name,
        }),
      });
    }
    navigate('work');
  };

  return (
    <div>
      <Logo height="64px" src="/logo_light.png" />
      <P>Welcome!</P>
      <P>
        To ensure the best experience, we&apos;ll need to ask you some
        questions, and add the bank account where you&apos;d like to be paid.
      </P>
      <H3>Basic information</H3>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* register your input into the hook by invoking the "register" function */}
        <Label>Full name</Label>
        <Input
          name="full_name"
          defaultValue={`${user.given_name} ${user.family_name}`}
          placeholder="Jonathan Appleseed"
          ref={register({ required: true })}
        />

        {/* include validation with required or other standard HTML validation rules */}
        <Label>Phone number</Label>
        <Input
          name="phone"
          defaultValue={user.phone}
          placeholder="555-222-1010"
          ref={register({ required: true })}
        />
        {/* errors will return when field validation fails  */}
        {/* {errors.phone && <span>This field is required</span>} */}

        <Label>Company name</Label>
        <Input
          name="company_name"
          defaultValue={user.contractor_profile?.company_name}
          placeholder="Apples to Apples Plumbing Co."
          ref={register({ required: false })}
        />
        <OnboardingNav slideNumber={1} />
      </form>
    </div>
  );
};
