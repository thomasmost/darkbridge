import React from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { useForm } from 'react-hook-form';
import { Dots } from '../components/Dots';
import { Icon } from '../elements/Icon';

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
export const OnboardingWork: React.FC<RouteComponentProps> = () => {
  const { register, handleSubmit, watch, errors } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data: any) => {
    console.log(data);
    navigate('finances');
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <H3>Work and experience</H3>
        <Label>What kind of work do you do?</Label>
        <H3>Your license</H3>
        <Label>License number</Label>
        <Input
          name="license_number"
          placeholder="123-456789"
          ref={register({ required: true })}
        />

        <Label>State</Label>
        <Input
          name="state"
          placeholder="Delaware"
          ref={register({ required: false })}
        />
        <OnboardingNav>
          <Dots count={5} checked={2} />
          <SubmitButton type="submit">
            <Icon name="Arrow-Right" />
          </SubmitButton>
        </OnboardingNav>
      </form>
    </div>
  );
};
