import styled from '@emotion/styled';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Redirect, Router } from '@reach/router';

import { theme } from '../theme';
import { AuthProvider } from '../AuthProvider';
import { OnboardingBasic } from '../pages/OnboardingBasic';
import { OnboardingWork } from '../pages/OnboardingWork';
import { OnboardingFinances } from '../pages/OnboardingFinances';
import { OnboardingBank } from '../pages/OnboardingBank';
import { OnboardingComplete } from '../pages/OnboardingComplete';

if (typeof window !== 'undefined') {
  require('react-toastify/dist/ReactToastify.css');
}

const AppContainer = styled.div`
  font-family: 'Poppins', Helvetica, sans-serif;
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

const OnboardingApp = () => {
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
          <Router basepath="onboarding">
            <Redirect from="/" to="basic" />
            <OnboardingBasic path="basic" />
            <OnboardingWork path="work" />
            <OnboardingFinances path="finances" />
            <OnboardingBank path="bank" />
            <OnboardingComplete path="complete" />
          </Router>
        </Main>
      </AppContainer>
    </AuthProvider>
  );
};

export default OnboardingApp;
