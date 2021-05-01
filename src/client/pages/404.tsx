import { RouteComponentProps } from '@reach/router';
import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

const WarningHeader = styled.h3`
  font-size: 1.6em;
  font-weight: 600;
  color: ${theme.pageHeaderColor};
  margin: 40px 0 20px;
`;

const Banner = styled.div`
  padding: ${theme.pad(4)};
  border-radius: 10px;
  background-color: ${theme.blockColorDefault};
  * {
    line-height: 2em;
    font-weight: 600;
  }
`;

export const Page404: React.FC<RouteComponentProps> = () => {
  return (
    <div>
      <WarningHeader>404</WarningHeader>
      <Banner>
        The page you were looking for doesn&apos;t exist, or perhaps it simply
        hasn&apos;t been built yet...
      </Banner>
    </div>
  );
};
