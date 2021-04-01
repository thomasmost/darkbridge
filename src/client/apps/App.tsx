import styled from '@emotion/styled';
import React from 'react';
import { ToastContainer } from 'react-toastify';
import { Router, Location } from '@reach/router';

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
import { NextAppointment } from '../pages/NextAppointment';
import { useWindowDimensions } from '../useWindowDimensions';
import { FooterPWA } from '../components/FooterPWA';
import { HeaderPWA } from '../components/HeaderPWA';
import { AppointmentPage } from '../pages/AppointmentPage';
import { StateProvider } from '../StateProvider';
import { CancelAppointment } from '../pages/CancelAppointment';
import { JobFlow } from '../pages/JobFlow';
import { RescheduleAppointment } from '../pages/RescheduleAppointment';
import { PaymentFlow } from '../pages/PaymentFlow';
import { ViewClients } from '../pages/ViewClients';
import { EditClientProfile } from '../pages/EditClientProfile';

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
  font-family: 'Circular Std', Helvetica, sans-serif;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  align-content: start;
`;

const App = ({ isMobile }: { isMobile?: boolean }) => {
  const { width } = useWindowDimensions();
  const shouldRenderPWA = width < 600 || isMobile;

  const Main = styled.main`
    background-color: ${theme.applicationBackgroundColor};
    box-sizing: border-box;
    color: ${theme.applicationTextColor};
    display: block;
    margin: auto;
    max-width: 1000px;
    padding: ${theme.pad(5)} ${theme.pad(5)} ${theme.pad(10)};
    width: 100%;
  `;
  const ScrollWrapper = styled.div`
    height: calc(100% - ${shouldRenderPWA ? `157px` : '52px'});
    max-height: calc(100% - ${shouldRenderPWA ? `157px` : '52px'});
    overflow: scroll;
    width: 100%;
  `;
  return (
    <AuthProvider>
      <StateProvider>
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
              {shouldRenderPWA ? (
                <Location>
                  {({ location }) => <HeaderPWA location={location} />}
                </Location>
              ) : (
                <Header />
              )}
              <ScrollWrapper>
                <Main>
                  <Router>
                    <Home path="/" />
                    <AddAppointment path="calendar/add-appointment" />
                    <AddClientProfile path="add-client" />
                    <EditClientProfile path="edit-client/:client_profile_id" />
                    <ApiSandbox path="sandbox" />
                    <AppointmentPage path="appointment/:appointment_id" />
                    <Calendar path="calendar" />
                    <CancelAppointment path="cancel-appointment/:appointment_id" />
                    <JobFlow path="job/:appointment_id/*" />
                    <Logout path="logout" />
                    <NextAppointment path="next-appointment" />
                    <PaymentFlow path="payment/:appointment_id/*" />
                    <Profile path="profile" />
                    <RescheduleAppointment path="reschedule-appointment/:appointment_id" />
                    <ViewClients path="clients" />
                  </Router>
                </Main>
              </ScrollWrapper>
              {shouldRenderPWA && <FooterPWA />}
            </AppContainer>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </StateProvider>
    </AuthProvider>
  );
};

export default App;
