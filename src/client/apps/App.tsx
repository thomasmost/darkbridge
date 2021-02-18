import styled from '@emotion/styled';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Router } from '@reach/router';

import { ApiSandbox } from '../pages/ApiSandbox';
import { Header } from '../components/Header';
import { Home } from '../pages/Home';
import { theme } from '../theme';
import { AuthProvider } from '../AuthProvider';
import { Logout } from '../pages/Logout';
import { Profile } from '../pages/Profile';
import { Calendar } from '../pages/Calendar';
import { AddAppointment } from '../pages/AddAppointment';
import { AddClientProfile } from '../pages/AddClientProfile';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

const muiTheme = createMuiTheme({
  palette: {
    primary: {
      main: theme.onboardingBackgroundColor,
    },
  },
});

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
      <ThemeProvider theme={muiTheme}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
                <AddAppointment path="calendar/add-appointment" />
                <AddClientProfile path="add-client" />
                <ApiSandbox path="sandbox" />
                <Calendar path="calendar" />
                <Profile path="profile" />
                <Logout path="logout" />
              </Router>
            </Main>
          </AppContainer>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
