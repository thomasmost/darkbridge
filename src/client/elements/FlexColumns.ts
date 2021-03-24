import styled from '@emotion/styled';

export const FlexColumns = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: tops;
  * {
    margin-right: 10px;
  }
  .expand {
    width: 100%;
  }
  *:last-child {
    margin-right: 0;
  }
`;
