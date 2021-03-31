import styled from '@emotion/styled';
import { Link, WindowLocation } from '@reach/router';
import React from 'react';
import { useAuth } from '../AuthProvider';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';
import { Popdown } from './Popdown';

const Logo = styled.img`
  display: block;
  align-self: center;
  position: relative;
`;

const Right = styled.span`
  align-items: center;
  display: flex;
  font-size: 1.2em;
  color: ${theme.buttonColorActive};
`;

const StyledHeader = styled.header`
  align-items: center;
  background-color: ${theme.headerBackgroundColor};
  box-shadow: 0 0 5px 5px white;
  color: ${theme.headerTextColor};
  display: flex;
  font-size: 1.2em;
  height: 50px;
  max-height: 50px;
  justify-content: space-between;
  left: 0;
  line-height: 50px;
  margin-bottom: 10px;
  padding: 10px 20px 10px;
  position: sticky;
  top: 0;
  width: 100%;
`;

const NavBack = styled.button`
  display: block;
  justify-content: space-between;
  font-size: 1.2em;
  background: none;
  color: ${theme.textColor};
  &:focus,
  &:active {
    color: ${theme.buttonColorActive};
    background: none;
  }
`;

const StyledLink = styled(Link)`
  color: ${theme.headerTextColor};
  display: inline-block;
  font-size: 0.6em;
  padding: 0 10px;
  &[aria-current] {
    color: ${theme.activePageColor};
  }
`;

const StyledAnchor = styled.a`
  color: ${theme.headerTextColor};
  display: block;
  font-size: 0.6em;
  padding: 0 10px;
  &[aria-current] {
    color: ${theme.activePageColor};
  }
  cursor: pointer;
`;

const DropdownLink = styled(StyledLink)`
  display: block;
`;

const ViewHeader = styled.h2`
  text-align: center;
  font-size: 1.2em;
`;

function getViewHeaderFromRouterLocation(location: WindowLocation) {
  switch (location.pathname) {
    case '/next-appointment': {
      return <ViewHeader>Next Appointment</ViewHeader>;
    }
    case '/calendar': {
      return <ViewHeader>Calendar</ViewHeader>;
    }
    case '/calendar/add-appointment': {
      return <ViewHeader>Add Appointment</ViewHeader>;
    }
    case '/add-client': {
      return <ViewHeader>New Customer</ViewHeader>;
    }
    case '/': {
      return <Logo height="40px" src="/logo_dark.svg" />;
    }
    default: {
      return <ViewHeader />;
    }
  }
}

export const HeaderPWA: React.FC<{ location: WindowLocation }> = ({
  location,
}) => {
  const { user, logout } = useAuth();
  if (!user) {
    // This is an internal application header;
    // we should always have a user
    return null;
  }

  async function handleLogout() {
    await fetch('/api/auth/logout');
    logout();
    window.location.assign('/login');
  }

  return (
    <StyledHeader>
      {Boolean(location.pathname !== '/') ? (
        <NavBack
          onClick={() => {
            window.history.back();
          }}
        >
          <Icon name="Arrow-Left" />
        </NavBack>
      ) : (
        <div style={{ width: '23px' }} />
      )}
      {getViewHeaderFromRouterLocation(location)}
      <Right>
        <Popdown right targetContent={<Icon name="Profile" />}>
          <DropdownLink to="/profile">
            Logged in as {user?.given_name}
          </DropdownLink>
          <StyledAnchor onClick={() => handleLogout()}>Logout</StyledAnchor>
        </Popdown>
      </Right>
    </StyledHeader>
  );
};
