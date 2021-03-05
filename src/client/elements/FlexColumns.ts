import styled from '@emotion/styled';

export const FlexColumns = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: tops;
  * {
    margin-right: 10px;
  }
  *:last-child {
    margin-right: 0;
  }
`;
