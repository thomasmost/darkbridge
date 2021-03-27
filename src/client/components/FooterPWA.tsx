import styled from '@emotion/styled';
import { Link } from '@reach/router';
import React from 'react';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';

const PWAFooter = styled.footer`
  align-items: center;
  background-color: ${theme.applicationBackgroundColor};
  box-shadow: 0 0 20px 20px ${theme.boxShadowColor};
  display: flex;
  height: ${theme.pwa_footer_height};
  justify-content: space-between;
  line-height: 50px;
  width: 100%;
  position: fixed;
  bottom: 0;
`;

const StyledLink = styled(Link)`
  color: ${theme.headerTextColor};
  display: block;
  font-size: 1.6em;
  &[aria-current] {
    color: ${theme.activePageColor};
  }
  width: 100%;
  text-align: center;
`;

export const FooterPWA: React.FC = () => {
  return (
    <PWAFooter>
      <StyledLink to="/calendar">
        <Icon name="Calendar" />
      </StyledLink>
      <StyledLink to="/">
        <Icon name="Home" />
      </StyledLink>
      <StyledLink to="/settings">
        <Icon name="Setting" />
      </StyledLink>
    </PWAFooter>
  );
};
