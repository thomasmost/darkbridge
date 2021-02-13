import React, { useEffect } from 'react';
import { useAuth } from '../AuthProvider';

import { RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { clientTokenStore } from '../clientTokenStore';
import { IUserDto } from '../../shared/user.dto';
import { theme } from '../theme';
import { useForm } from 'react-hook-form';

const FormHeader = styled.h2`
  font-weight: 600;
  color: white;
`;

const Instruction = styled.p`
  color: ${theme.darkModeTextColor};
`;

const Input = styled.input`
  font-size: 1em;
`;

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

export const OnboardingComplete: React.FC<RouteComponentProps> = () => {
  const { user } = useAuth();
  const { register, handleSubmit, watch, errors } = useForm();
  const onSubmit = (data: any) => console.log(data);

  useEffect(() => {
    if (!user) {
      // navigate('/');
      location.assign('/');
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* register your input into the hook by invoking the "register" function */}
      <input name="example" defaultValue="test" ref={register} />

      {/* include validation with required or other standard HTML validation rules */}
      <input name="exampleRequired" ref={register({ required: true })} />
      {/* errors will return when field validation fails  */}
      {errors.exampleRequired && <span>This field is required</span>}

      <input type="submit" />
    </form>
  );
};
