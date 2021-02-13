import React, { useEffect } from 'react';
import { useAuth } from '../AuthProvider';

import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { clientTokenStore } from '../clientTokenStore';
import { IUserDto } from '../../shared/user.dto';
import { theme } from '../theme';
import { useForm } from 'react-hook-form';
import { Icon } from '../elements/Icon';
import { Dots } from '../components/Dots';

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

const SubmitButton = styled.button`
  color: ${theme.darkModeTextColor};
  background-color: ${theme.buttonColorActive};
  border-radius: 50%;
  height: 50px;
  width: 50px;
  font-size: 1.8em;
  line-height: 50px;
`;

const OnboardingNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const OnboardingBasic: React.FC<RouteComponentProps> = () => {
  const { register, handleSubmit, watch, errors } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data: any) => {
    console.log(data);
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
          ref={register}
        />

        {/* include validation with required or other standard HTML validation rules */}
        <Label>Phone number</Label>
        <Input
          name="phone"
          placeholder="555-222-1010"
          ref={register({ required: true })}
        />
        {/* errors will return when field validation fails  */}
        {errors.exampleRequired && <span>This field is required</span>}

        <Label>Company name</Label>
        <Input
          name="company_name"
          placeholder="Apples to Apples Plumbing Co."
          ref={register({ required: false })}
        />
        <OnboardingNav>
          <Dots count={5} checked={1} />
          <SubmitButton type="submit">
            <Icon name="Arrow-Right" />
          </SubmitButton>
        </OnboardingNav>
      </form>
    </div>
  );
};
