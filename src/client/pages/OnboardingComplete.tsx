import React from 'react';

import { RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { Dots } from '../components/Dots';
import { OnboardingNav } from '../elements/OnboardingElements';

const Logo = styled.img`
  display: block;
  margin: auto;
  margin-top: 40px;
  margin-bottom: 60px;
`;

const H3 = styled.h3`
  color: ${theme.darkModeTextColor};
  display: block;
  font-size: 1.4em;
  margin: 50px 0 30px;
  text-align: center;
`;

const Button = styled.button`
  height: 50px;
  line-height: 50px;
  color: white;
  border-radius: 25px;
  width: 100%;
  margin-bottom: 100px;
`;

export const OnboardingComplete: React.FC<RouteComponentProps> = () => {
  return (
    <div>
      <Logo height="64px" src="/logo_light.png" />
      <H3>You&apos;re all set!</H3>
      <Button onClick={() => location.assign('/')}>Go to my Dashboard</Button>
      <OnboardingNav slideNumber={5} hideContinueButton />
    </div>
  );
};
