import React from 'react';

import { RouteComponentProps } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';

const SuccessHeader = styled.h3`
  font-size: 1.6em;
  font-weight: 600;
  color: ${theme.pageHeaderColor};
  margin: 40px 0 20px;
`;

export const AppointmentConfirmedByClient: React.FC<
  RouteComponentProps<{ appointment_id: string }>
> = () => {
  // const navigate = useNavigate();
  // const { token } = props;
  // const [
  //   currentAppointment,
  //   setAppointment,
  // ] = useState<AppointmentAttributes | null>(null);

  // useEffect(() => {
  //   fetch(`/api/client_confirmation/appointment/${token}`, {
  //     headers: {
  //       Accept: mimeType,
  //       'Content-Type': mimeType,
  //     },
  //     method: 'GET',
  //   }).then(async function (response) {
  //     if (response.status === 200) {
  //       const data = await response.json();
  //       setAppointment(data);
  //     } else {
  //       // const message = await response.text();
  //       navigate('expired');
  //     }
  //   });
  // }, [token]);

  // if (!token) {
  //   navigate('/404');
  //   return null;
  // }
  // if (!currentAppointment) {
  //   return <div>Loading...</div>;
  // }
  // const isAlreadyCanceled =
  //   currentAppointment.status === AppointmentStatus.canceled;
  return (
    <div>
      <SuccessHeader>Your appointment is confirmed!</SuccessHeader>
    </div>
  );
};
