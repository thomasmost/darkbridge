import styled from '@emotion/styled';
import { Link } from '@reach/router';
import React from 'react';
import { useAuth } from '../AuthProvider';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';
import { Popdown } from './Popdown';

const Logo = styled.span`
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

const DropdownLink = styled(StyledLink)`
  display: block;
`;

export const Header: React.FC = () => {
  const { user } = useAuth();
  return (
    <StyledHeader>
      <HeaderContents>
        <LeftNav>
          <StyledLink to="/">
            <Logo>
              <img height="40px" src="/logo.png" />
            </Logo>
          </StyledLink>
          {Boolean(user) && <StyledLink to="/sandbox">API Sandbox</StyledLink>}
          {!user && <StyledLink to="/register">Register</StyledLink>}
          {!user && <StyledLink to="/login">Log In</StyledLink>}
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
              <DropdownLink to="/logout">Logout</DropdownLink>
            </Popdown>
          )}
        </Right>
      </HeaderContents>
    </StyledHeader>
  );
};
