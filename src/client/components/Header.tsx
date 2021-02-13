import styled from '@emotion/styled';
import { Link } from '@reach/router';
import React from 'react';
import { useAuth } from '../AuthProvider';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';
import { Popdown } from './Popdown';

const Logo = styled.img`
  display: inline-block;
  margin-right: 10px;
  position: relative;
  top: 6px;
`;

const Right = styled.span`
  display: block;
  float: right;
`;

const LoggedInHeader = styled.span`
  padding: 0 10px;
  margin-right: 10px;
`;

const StyledHeader = styled.header`
  height: 50px;
  line-height: 50px;
  padding: 0 20px;
  position: sticky;
  top: 0;
  left: 0;
  background-color: ${theme.headerBackgroundColor};
  border-bottom: 2px solid ${theme.headerBorderColor};
  color: ${theme.headerTextColor};
  font-size: 1.2em;
  width: 100%;
`;

const HeaderContents = styled.div`
  max-width: 1000px;
  margin: auto;
  display: flex;
  justify-content: space-between;
`;

const LeftNav = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLink = styled(Link)`
  color: ${theme.headerTextColor};
  display: inline-block;
  font-size: 0.8em;
  text-decoration: none;
  padding: 0 10px;
  &[aria-current] {
    color: ${theme.activePageColor};
  }
`;

const StyledAnchor = styled.a`
  color: ${theme.headerTextColor};
  display: block;
  font-size: 0.8em;
  text-decoration: none;
  padding: 0 10px;
  &[aria-current] {
    color: ${theme.activePageColor};
  }
  cursor: pointer;
`;

const DropdownLink = styled(StyledLink)`
  display: block;
`;

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await fetch('/api/auth/logout');
    logout();
    location.assign('/');
  }

  return (
    <StyledHeader>
      <HeaderContents>
        <LeftNav>
          <StyledLink to="/">
            <Logo height="40px" src="/logo.png" />
          </StyledLink>
          {Boolean(user) && <StyledLink to="/sandbox">API Sandbox</StyledLink>}
        </LeftNav>
        <Right>
          {Boolean(user) && (
            <Popdown
              right
              targetContent={
                <LoggedInHeader>
                  <Icon name="Profile" />
                </LoggedInHeader>
              }
            >
              <DropdownLink to="/profile">
                Logged in as {user?.given_name}
              </DropdownLink>
              <StyledAnchor onClick={() => handleLogout()}>Logout</StyledAnchor>
            </Popdown>
          )}
        </Right>
      </HeaderContents>
    </StyledHeader>
  );
};
