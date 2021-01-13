import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React from 'react';
import { theme } from '../theme';

import { Icon } from '../elements/Icon';

const Header = styled.h1`
  font-size: 2em;
  padding: 20px;
  color: ${theme.pageHeaderColor};
`;

const HeaderText = styled.span`
  padding-left: 10px;
`;

export const Home: React.FC<RouteComponentProps> = () => (
  <div>
    <Header>
      <Icon name="home" />
      <HeaderText>Welcome Home</HeaderText>
    </Header>
  </div>
);
