import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { Dots } from '../components/Dots';
import { Icon } from '../elements/Icon';

const H3 = styled.h3`
  color: ${theme.darkModeTextColor};
  display: block;
  font-size: 1.4em;
  margin: 50px 0 30px;
`;

const OnboardingNav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

export const OnboardingBank: React.FC<RouteComponentProps> = () => {
  const navigate = useNavigate();

  const onSubmit = () => {
    navigate('complete');
  };

  return (
    <div>
      <H3>Bank Connection coming soon...</H3>
      <OnboardingNav>
        <Dots count={5} checked={4} />
        <SubmitButton type="submit" onClick={onSubmit}>
          <Icon name="Arrow-Right" />
        </SubmitButton>
      </OnboardingNav>
    </div>
  );
};
