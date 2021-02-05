import styled from '@emotion/styled';
import { theme } from '../theme';

export const FormFieldPair = styled.div`
  /* display: flex; */
  margin-bottom: 10px;
  p {
    display: block;
    width: 100%;
    color: ${theme.textColor};
    margin: 5px 0;
  }
  input {
    display: block;
    width: 100%;
    padding: 10px;
    border-radius: 3px;
    outline: none;
    border: none;
    box-sizing: border-box;
  }
`;
