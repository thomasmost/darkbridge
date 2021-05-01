import React, { useEffect, useState } from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { theme } from '../theme';
import { AppointmentCard } from '../components/AppointmentCard';
import { Button } from '../elements/Button';
import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentStatus } from '../../shared/enums';

const WarningHeader = styled.h3`
  font-size: 1.6em;
  font-weight: 600;
  color: ${theme.pageHeaderColor};
  margin: 40px 0 20px;
`;

const mimeType = 'application/json';

async function submit(token: string) {
  try {
    const response = await fetch('/api/client_confirmation/cancel', {
      headers: {
        Accept: mimeType,
        'Content-Type': mimeType,
      },
      method: 'PUT',
      body: JSON.stringify({
        token,
      }),
    });
    if (response.status !== 204) {
      const error = await response.text();
      toast.error(error);
      return;
    }
    toast.success('Appointment canceled');
  } catch (err) {
    toast.error('Request failed');
  }
}

function renderCancelActions(token: string) {
  return (
    <>
      <WarningHeader>Are you sure?</WarningHeader>
      <p>We&apos;ll let your service provider know.</p>
      <Button onClick={() => submit(token)}>Cancel Appointment</Button>
    </>
  );
}

export const CancelAppointmentByClient: React.FC<
  RouteComponentProps<{ token: string }>
> = (props) => {
  const navigate = useNavigate();
  const { token } = props;
  const [
    currentAppointment,
    setAppointment,
  ] = useState<AppointmentAttributes | null>(null);

  useEffect(() => {
    fetch(`/api/client_confirmation/appointment/${token}`, {
      headers: {
        Accept: mimeType,
        'Content-Type': mimeType,
      },
      method: 'GET',
    }).then(async function (response) {
      if (response.status === 200) {
        const data = await response.json();
        setAppointment(data);
      } else {
        // const message = await response.text();
        navigate('expired');
      }
    });
  }, [token]);

  if (!token) {
    navigate('/404');
    return null;
  }
  if (!currentAppointment) {
    return <div>Loading...</div>;
  }
  const isAlreadyCanceled =
    currentAppointment.status === AppointmentStatus.canceled;
  return (
    <div>
      <WarningHeader>
        {isAlreadyCanceled
          ? `Your appointment for "${currentAppointment.summary}" has already been canceled`
          : `Cancel your appointment: ${currentAppointment.summary}`}
      </WarningHeader>
      <AppointmentCard appointment={currentAppointment} warning />
      {!isAlreadyCanceled && renderCancelActions(token)}
    </div>
  );
};
