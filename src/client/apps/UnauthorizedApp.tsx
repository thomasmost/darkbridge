import styled from '@emotion/styled';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Redirect, Router } from '@reach/router';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { theme } from '../theme';
import { AuthProvider } from '../AuthProvider';
import { Logout } from '../pages/Logout';
import { RequestPasswordReset } from '../pages/RequestPasswordReset';
import { ResetPassword } from '../pages/ResetPassword';
import { EmailVerified } from '../pages/EmailVerified';

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
  background-color: ${theme.onboardingBackgroundColor};
  height: calc(100vh - 80px);
  width: 100%;
  display: block;
  padding: 25px;
  max-width: 1000px;
  margin: auto;
`;

const UnauthorizedApp = () => {
  return (
    <AuthProvider>
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
          <Router>
            <Redirect from="/" to="register" />
            <EmailVerified path="email_verified" />
            <Login path="login" />
            <Logout path="logout" />
            <Register path="register" />
            <RequestPasswordReset path="request_password_reset" />
            <ResetPassword path="reset_password/:token" />
          </Router>
        </Main>
      </AppContainer>
    </AuthProvider>
  );
};

export default UnauthorizedApp;