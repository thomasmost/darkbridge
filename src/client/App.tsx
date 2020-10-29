import styled from '@emotion/styled';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Router } from '@reach/router';

import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { theme } from './theme';
import { AuthProvider } from './AuthProvider';

if (typeof window !== 'undefined') {
  require('react-toastify/dist/ReactToastify.css');
}

const AppContainer = styled.div`
  font-family: 'DM Sans', Helvetica, sans-serif;
  display: flex;
  flex-wrap: wrap;
`;

const Main = styled.main`
  color: ${theme.applicationTextColor};
  background-image: linear-gradient(
    to right,
    ${theme.applicationBackgroundLight},
    ${theme.applicationBackgroundDark}
  );
  height: calc(100vh - 80px);
  width: 100%;
  display: block;
  padding: 20px;
`;

const App = () => {
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
        <Header />
        <Main>
          <Router>
            <Home path="/" />
            <Dashboard path="dashboard" />
            <Login path="login" />
            <Register path="register" />
          </Router>
        </Main>
      </AppContainer>
    </AuthProvider>
  );
};

export default App;
