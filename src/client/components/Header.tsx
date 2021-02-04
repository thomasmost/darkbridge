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

const PopdownWrapper = styled.div`
  font-size: 0.8em;
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

const StyledLink = styled(Link)`
  color: ${theme.headerTextColor};
  display: inline-block;
  text-decoration: none;
  padding: 0 10px;
  &[aria-current] {
    color: ${theme.activePageColor};
  }
`;

export const Header: React.FC = () => {
  const { user } = useAuth();
  return (
    <StyledHeader>
      <StyledLink to="/">
        <Logo>
          <img height="40px" src="/logo.png" />
        </Logo>
      </StyledLink>
      <StyledLink to="/dashboard">Dashboard</StyledLink>
      {!user && <StyledLink to="/register">Register</StyledLink>}
      {!user && <StyledLink to="/login">Log In</StyledLink>}
      <Right>
        {Boolean(user) && (
          <PopdownWrapper>
            <Popdown
              right
              targetContent={
                <LoggedInHeader>
                  <Icon name="profile" />
                </LoggedInHeader>
              }
            >
              <StyledLink to="/profile">
                Logged in as {user?.given_name}
              </StyledLink>
              <StyledLink to="/logout">Logout</StyledLink>
            </Popdown>
          </PopdownWrapper>
        )}
      </Right>
    </StyledHeader>
  );
};
