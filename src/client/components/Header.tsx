import styled from '@emotion/styled';
import { Link } from '@reach/router';
import React from 'react';
import { useAuth } from '../AuthProvider';
import { theme } from '../theme';
import { Popdown } from './Popdown';

const Logo = styled.span`
  display: inline-block;
  margin-right: 10px;
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
  height: 40px;
  line-height: 40px;
  padding: 0 20px;
  position: sticky;
  top: 0;
  left: 0;
  background-color: ${theme.headerBackground};
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
        <Logo>Darkbridge</Logo>
      </StyledLink>
      <StyledLink to="/dashboard">Dashboard</StyledLink>
      {!user && <StyledLink to="/register">Register</StyledLink>}
      {!user && <StyledLink to="/login">Log In</StyledLink>}
      <Right>
        {Boolean(user) && (
          <Popdown
            targetContent={
              <LoggedInHeader>Logged in as {user?.given_name}</LoggedInHeader>
            }
          >
            <StyledLink to="/logout">Logout</StyledLink>
          </Popdown>
        )}
      </Right>
    </StyledHeader>
  );
};
