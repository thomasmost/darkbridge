import styled from '@emotion/styled';
import { useNavigate } from '@reach/router';
import React from 'react';
import { Dots } from '../components/Dots';
import { theme } from '../theme';
import { Icon } from './Icon';

const NavContainer = styled.div`
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

export const OnboardingNav: React.FC<{
  slideNumber: number;
  hideContinueButton?: boolean;
}> = ({ slideNumber, hideContinueButton }) => {
  const navigate = useNavigate();

  const navigations = [
    () => navigate('basic'),
    () => navigate('work'),
    () => navigate('finances'),
    () => navigate('bank'),
    () => navigate('complete'),
  ];

  return (
    <NavContainer>
      <Dots navigations={navigations} count={5} checked={slideNumber} />
      {!hideContinueButton && (
        <SubmitButton type="submit">
          <Icon name="Arrow-Right" />
        </SubmitButton>
      )}
    </NavContainer>
  );
};
