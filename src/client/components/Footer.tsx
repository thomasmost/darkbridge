import styled from '@emotion/styled';
import React from 'react';
import { theme } from '../theme';

const StyledFooter = styled.footer`
  width: 100%;
  padding: 20px;
  color: ${theme.headerTextColor};
  background-color: ${theme.headerBackground};
`;

export const Footer: React.FC = () => (
  <StyledFooter>Copyright 2020</StyledFooter>
);
