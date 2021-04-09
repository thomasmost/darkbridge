import React from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { useForm } from 'react-hook-form';
import { H3, OnboardingNav, P } from '../elements/OnboardingElements';
import { Input } from '../elements/Input';
import { useAuth } from '../AuthProvider';
import { putRequest } from '../services/api.svc';
import { Label } from '../elements/Label';
import { FlexColumns } from '../elements/FlexColumns';

const Logo = styled.img`
  display: block;
  margin: auto;
  margin-top: 40px;
  margin-bottom: 60px;
`;

type BasicFormFields = {
  given_name: string;
  family_name: string;
  phone: string;
  company_name: string;
};

export const OnboardingBasic: React.FC<RouteComponentProps> = () => {
  const { user, updateUser } = useAuth();
  const { register, handleSubmit } = useForm<BasicFormFields>();
  const navigate = useNavigate();
  if (!user) {
    return null;
  }

  const onSubmit = async (data: BasicFormFields) => {
    const { given_name, family_name, phone, company_name } = data;
    const userUpdates = {
      family_name,
      given_name,
      phone,
    };
    await putRequest('user/self', 'text', userUpdates);
    updateUser(userUpdates);
    if (company_name) {
      await putRequest('contractor_profile', 'text', {
        company_name,
      });
    }
    navigate('work');
  };

  return (
    <div>
      <Logo height="64px" src="/logo_light.svg" />
      <P>Welcome!</P>
      <P>
        To ensure the best experience, we&apos;ll need to ask you some
        questions, and add the bank account where you&apos;d like to be paid.
      </P>
      <H3>Basic information</H3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexColumns>
          <div className="expand">
            <Label>First name</Label>
            <Input
              name="given_name"
              defaultValue={user.given_name}
              placeholder="Jonathan"
              ref={register({ required: true })}
            />
          </div>
          <div className="expand">
            <Label>Last name</Label>
            <Input
              name="family_name"
              defaultValue={user.family_name}
              placeholder="Appleseed"
              ref={register({ required: true })}
            />
          </div>
        </FlexColumns>
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
