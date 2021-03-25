import styled from '@emotion/styled';
import { Link } from '@reach/router';
import React from 'react';
import { FlashCard } from '../elements/Card';
import { Icon } from '../elements/Icon';
import { Popdown } from './Popdown';
import { theme } from '../theme';
import { useAuth } from '../AuthProvider';

const Logo = styled.img`
  display: inline-block;
  margin-right: 10px;
`;

const Right = styled.span`
  display: block;
  float: right;
`;

const LoggedInHeader = styled.span`
  font-size: 1.2em;
`;

const StyledHeader = styled.header`
  height: 50px;
  line-height: 50px;
  position: sticky;
  top: 0;
  left: 0;
  background-color: ${theme.headerBackgroundColor};
  border-bottom: 2px solid ${theme.headerBorderColor};
  color: ${theme.headerTextColor};
  font-size: 1.2em;
  width: 100%;
  z-index: 1;
`;

const HeaderContents = styled.div`
  max-width: 1000px;
  margin: auto;
  padding: 0 25px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
`;

const LeftNav = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLink = styled(Link)`
  color: ${theme.headerTextColor};
  display: flex;
  align-items: center;
  font-size: 0.8em;
  padding-right: 20px;
  padding-left: 0px;
  &[aria-current] {
    color: ${theme.activePageColor};
  }
`;

const StyledAnchor = styled.a`
  color: ${theme.headerTextColor};
  display: block;
  font-size: 0.8em;
  padding: 0 10px;
  &[aria-current] {
    color: ${theme.activePageColor};
  }
  cursor: pointer;
`;

const DropdownLink = styled(StyledLink)`
  display: block;
  padding-left: 10px;
`;

const MenuIcon = styled.div`
  font-size: 20px;
  display: inline-block;
  margin-right: 5px;
`;

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  if (!user) {
    // This is an internal application header;
    // we should always ahve a user
    return null;
  }

  async function handleLogout() {
    await fetch('/api/auth/logout');
    logout();
    location.assign('/login');
  }

  return (
    <StyledHeader>
      <HeaderContents>
        <LeftNav>
          <StyledLink to="/">
            <Logo height="40px" src="/logo_dark.svg" />
          </StyledLink>
          <StyledLink to="/calendar">
            <MenuIcon>
              <Icon name="Calendar" />
            </MenuIcon>
            Calendar
          </StyledLink>
        </LeftNav>
        <Right>
          <Popdown
            right
            targetContent={
              <LoggedInHeader>
                <Icon name="Profile" />
              </LoggedInHeader>
            }
          >
            <FlashCard>
              <DropdownLink to="/profile">
                Logged in as {user?.given_name}
              </DropdownLink>
              <StyledAnchor onClick={() => handleLogout()}>Logout</StyledAnchor>
            </FlashCard>
          </Popdown>
        </Right>
      </HeaderContents>
    </StyledHeader>
  );
};
