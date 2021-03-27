import styled from '@emotion/styled';
import { theme } from '../theme';

export const Card = styled.div`
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px 20px ${theme.boxShadowColor};
  cursor: pointer;
  padding: ${theme.pad(4)};
`;

export const FlashCard = styled.div`
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 5px 5px 0 ${theme.boxShadowColor};
  cursor: pointer;
  padding: ${theme.pad(4)};
`;
