import styled from '@emotion/styled';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Redirect, Router } from '@reach/router';
import { theme } from '../theme';
import { AuthProvider } from '../AuthProvider';
import { CancelAppointmentByClient } from '../pages/CancelAppointmentByClient';

if (typeof window !== 'undefined') {
  require('react-toastify/dist/ReactToastify.css');
}

const AppContainer = styled.div`
  font-family: 'Circular Std', Helvetica, sans-serif;
  display: flex;
  flex-wrap: wrap;
`;

const Main = styled.main`
  color: ${theme.applicationTextColor};
  background-color: ${theme.applicationBackgroundColor};
  height: calc(100vh - 80px);
  width: 100%;
  display: block;
  padding: 25px;
  max-width: 1000px;
  margin: auto;
`;

const Logo = styled.img`
  display: block;
  margin: auto;
  margin-top: 40px;
  margin-bottom: 60px;
`;

const SecuredClientPortal = () => {
  return (
    <AppContainer>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Main>
        <Logo height="64px" src="/logo_dark.svg" />
        <Router basepath="e/client_portal">
          <CancelAppointmentByClient path=":token/cancel" />
        </Router>
      </Main>
    </AppContainer>
  );
};

export default SecuredClientPortal;
