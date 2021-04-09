import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../theme';

export const Spacer: React.FC<{ y: number }> = ({ y }) => {
  const AdjustedSpacer = styled.div`
    height: ${theme.pad(y)};
    width: 100%;
  `;
  return <AdjustedSpacer />;
};
