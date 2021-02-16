import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { OnboardingNav } from '../elements/OnboardingElements';
import { useForm } from 'react-hook-form';

const H3 = styled.h3`
  color: ${theme.darkModeTextColor};
  display: block;
  font-size: 1.4em;
  margin: 50px 0 30px;
`;

export const OnboardingBank: React.FC<RouteComponentProps> = () => {
  const { handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async () => {
    navigate('complete');
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <H3>Bank Connection coming soon...</H3>
        <OnboardingNav slideNumber={4} />
      </form>
    </div>
  );
};
