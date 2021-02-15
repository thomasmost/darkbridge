import React from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { useForm } from 'react-hook-form';
import { OnboardingNav } from '../elements/OnboardingElements';

// async function updateUser(
//   name: string,
//   phoneNumber: string,
//   comapnyName: string,
// ) {
//   try {
//     const result = await fetch('api/user/register', {
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       method: 'POST',
//       body: JSON.stringify({
//         email,
//         password,
//         confirm_password,
//       }),
//     });
//     const data = (await result.json()) as { token: string; user: IUserDto };
//     clientTokenStore.set(data.token);
//     return data.user;
//   } catch (err) {
//     toast.error('Registration failed');
//   }
// }

const Logo = styled.img`
  display: block;
  margin: auto;
  margin-top: 40px;
  margin-bottom: 60px;
`;

const P = styled.p`
  color: ${theme.darkModeTextColor};
`;

const H3 = styled.h3`
  color: ${theme.darkModeTextColor};
  display: block;
  font-size: 1.4em;
  margin: 50px 0 30px;
`;

const Label = styled.label`
  color: ${theme.subheaderTextColor};
  display: block;
  margin-bottom: 10px;
`;

const Input = styled.input`
  border-radius: 10px;
  box-sizing: border-box;
  display: block;
  margin-bottom: 30px;
  padding: 10px 20px;
  width: 100%;
`;

type BasicFormFields = {
  full_name: string;
  phone: string;
  company_name: string;
};

export const OnboardingBasic: React.FC<RouteComponentProps> = () => {
  const { register, handleSubmit, watch, errors } = useForm<BasicFormFields>();
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
