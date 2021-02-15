import React from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import {
  H3,
  Input,
  Label,
  OnboardingNav,
  P,
} from '../elements/OnboardingElements';

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
  const { register, handleSubmit } = useForm<BasicFormFields>();
  const navigate = useNavigate();

  const onSubmit = async (data: BasicFormFields) => {
    const { full_name, phone, company_name } = data;
    const nameParts = full_name.split(' ');
    const family_name = nameParts.pop();
    const given_name = nameParts.join(' ');
    await fetch('/api/user/self', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify({
        family_name,
        given_name,
        phone,
      }),
    });
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
          placeholder="Jonathan Appleseed"
          ref={register({ required: true })}
        />

        {/* include validation with required or other standard HTML validation rules */}
        <Label>Phone number</Label>
        <Input
          name="phone"
          placeholder="555-222-1010"
          ref={register({ required: true })}
        />
        {/* errors will return when field validation fails  */}
        {/* {errors.phone && <span>This field is required</span>} */}

        <Label>Company name</Label>
        <Input
          name="company_name"
          placeholder="Apples to Apples Plumbing Co."
          ref={register({ required: false })}
        />
        <OnboardingNav slideNumber={1} />
      </form>
    </div>
  );
};
