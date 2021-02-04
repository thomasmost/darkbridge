import styled from '@emotion/styled';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Router } from '@reach/router';

import { Dashboard } from './pages/Dashboard';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { theme } from './theme';
import { AuthProvider } from './AuthProvider';
import { Logout } from './pages/Logout';

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
  background-color: ${theme.applicationBackgroundColor};
  height: calc(100vh - 80px);
  width: 100%;
  display: block;
  padding: 25px;
  max-width: 1000px;
  margin: auto;
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
            <Logout path="logout" />
            <Register path="register" />
          </Router>
        </Main>
      </AppContainer>
    </AuthProvider>
  );
};

export default App;
