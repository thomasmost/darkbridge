import React from 'react';

import { RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { H3, Logo, OnboardingNav } from '../elements/OnboardingElements';

const FinalH3 = styled(H3)`
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
      <FinalH3>You&apos;re all set!</FinalH3>
      <Button onClick={() => location.assign('/')}>Go to my Dashboard</Button>
      <OnboardingNav slideNumber={5} hideContinueButton />
    </div>
  );
};
