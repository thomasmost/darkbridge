import styled from '@emotion/styled';
import { theme } from '../theme';

export const AccountForm = styled.form`
  display: block;
  max-width: 400px;
  margin: auto;

  a {
    color: ${theme.passiveLinkColor};
    transition: color 0.5s;
    &:hover,
    &:focus {
      color: ${theme.activeLinkColor};
    }
  }
  button,
  input[type='submit'] {
    outline: none;
    border: none;
    margin: 15px 0 10px;
    background-color: ${theme.buttonColorPassive};
    color: ${theme.buttonTextColor};
    padding: 10px;
    width: 100%;
    border-radius: 3px;
    transition: 0.5s background-color;
    cursor: pointer;
    &:hover,
    &:focus {
      background-color: ${theme.buttonColorActive};
    }
  }
`;
