import styled from '@emotion/styled';

export const InlineFormField = styled.div`
  display: flex;
  margin-bottom: 10px;
  *:first-child {
    display: block;
    width: 50%;
  }
  *:nth-child(2) {
    display: block;
    width: 50%;
    padding: 0 20px;
  }
`;
