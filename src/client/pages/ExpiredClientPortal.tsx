import React, { useState } from 'react';

import { Link, RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { toast } from 'react-toastify';
import { theme } from '../theme';

const Banner = styled.div`
  padding: ${theme.pad(4)};
  border-radius: 10px;
  background-color: ${theme.blockColorDefault};
  * {
    line-height: 2em;
    font-weight: 600;
  }
`;

const mimeType = 'application/json';

async function onRequestNewLink(
  token: string,
  setRequestedNew: (bool: boolean) => void,
) {
  try {
    const response = await fetch('/api/client_confirmation/request_new', {
      headers: {
        Accept: mimeType,
        'Content-Type': mimeType,
      },
      method: 'POST',
      body: JSON.stringify({
        token,
      }),
    });
    if (response.status !== 204) {
      const error = await response.text();
      toast.error(error);
      return;
    }
    toast.success('Done');
    setRequestedNew(true);
  } catch (err) {
    toast.error('Please contact support');
  }
}

export const ExpiredClientPortal: React.FC<
  RouteComponentProps<{ token: string }>
> = (props) => {
  const navigate = useNavigate();
  const [requestedNew, setRequestedNew] = useState<boolean>(false);
  const { token } = props;

  if (!token) {
    navigate('/404');
    return null;
  }
  if (requestedNew) {
    return (
      <div>
        <Banner>Check your email.</Banner>
      </div>
    );
  }
  return (
    <div>
      <Banner>
        This link has expired. If you need to cancel or confirm an appointment,{' '}
        <Link onClick={() => onRequestNewLink(token, setRequestedNew)} to="#">
          click here
        </Link>{' '}
        to request a new link.
      </Banner>
    </div>
  );
};
