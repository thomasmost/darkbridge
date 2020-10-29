import styled from '@emotion/styled';
import { theme } from '../theme';

export const AccountForm = styled.form`
  display: block;
  max-width: 800px;
  margin: auto;

  a {
    color: ${theme.passiveLinkColor};
    transition: color 0.5s;
    text-decoration: none;
    &:hover,
    &:focus {
      color: ${theme.activeLinkColor};
    }
  }
`;
