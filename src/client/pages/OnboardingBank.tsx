import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { OnboardingNav } from '../elements/OnboardingElements';

const H3 = styled.h3`
  color: ${theme.darkModeTextColor};
  display: block;
  font-size: 1.4em;
  margin: 50px 0 30px;
`;

export const OnboardingBank: React.FC<RouteComponentProps> = () => {
  const navigate = useNavigate();

  const onSubmit = () => {
    navigate('complete');
  };

  return (
    <div>
      <H3>Bank Connection coming soon...</H3>
      <OnboardingNav slideNumber={4} />
    </div>
  );
};
