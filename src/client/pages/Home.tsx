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

export const Home: React.FC<RouteComponentProps> = () => (
  <div>
    <Header>
      <Icon name="darkbridge" />
      Welcome Home
    </Header>
  </div>
);
