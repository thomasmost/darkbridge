import styled from '@emotion/styled';
import { Link, RouteComponentProps } from '@reach/router';
import React from 'react';
import { FlexColumns } from '../elements/FlexColumns';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';

const StyledLink = styled(Link)`
  color: ${theme.buttonColorActive};
  text-decoration: none;
  font-size: 2em;
`;

export const Calendar: React.FC<RouteComponentProps> = () => {
  return (
    <div>
      <FlexColumns>
        <div>List view</div>
        <StyledLink to="add-appointment">
          <Icon name="Plus" />
        </StyledLink>
      </FlexColumns>
      [Calendar List View here]
    </div>
  );
};
