import { RouteComponentProps, useNavigate } from '@reach/router';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { getRequest, putRequest } from '../services/api.svc';

import {
  ClientProfileForm,
  ClientProfileFormValues,
} from '../components/ClientProfileForm';
import { CardSetupForm } from '../components/CardSetupForm';
import styled from '@emotion/styled';
import { theme } from '../theme';

const stripePromise = loadStripe('');

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  padding: ${theme.pad(10)};
  background-color: ${theme.blockColorDefault};
  border-radius: 10px;
  > * {
    width: 500px;
  }
`;

const SvgContainer = styled.div`
  padding: ${theme.pad(5)} 0;
  svg {
    // width: 400px;
    max-width: 400px;
    display: block;
    margin: auto;
  }
`;

const SVG = styled.svg`
  opacity: 0.5;
  .cls-1 {
    fill: #909090;
  }
  .cls-2 {
    fill: #161616;
  }
`;

export const AddClientPaymentMethod: React.FC<
  RouteComponentProps<{ client_profile_id: string }>
> = ({ client_profile_id }) => {
  const [dots, setDots] = useState<number>(0);
  // const navigate = useNavigate();
  const [
    clientProfile,
    setClientProfile,
  ] = useState<ClientProfileAttributes | null>(null);

  useEffect(() => {
    if (!client_profile_id) {
      return;
    }
    getRequest(`client_profile/${client_profile_id}`).then((result) => {
      if (result.error) {
        return;
      }
      setClientProfile(result.data);
    });
  }, []);

  if (!clientProfile) {
    return null;
  }

  return (
    <Elements stripe={stripePromise}>
      <Wrapper>
        <SvgContainer>
          <SVG
            id="Layer_1"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 684 432"
          >
            <path
              className="cls-1"
              d="M320.06,176.83H275.53c0-4.59-.07-8.85.07-13.1a3.34,3.34,0,0,1,1.55-2q12.06-7.92,24.23-15.67a7.47,7.47,0,0,1,3.81-1.07q42.82-.09,85.67,0c.71,0,1.43.14,2.37.23v31.7H320.06Z"
            />
            <path className="cls-2" d="M320.06,176.83h30.85V285H320.06Z" />
            <path
              className="cls-1"
              d="M409.54,270.61a16.33,16.33,0,1,1-32.65-.21,16.33,16.33,0,1,1,32.65.21Z"
            />
            <path
              className="cls-1"
              d="M629.38,431H54.62A54.72,54.72,0,0,1,0,376.34V55.66A54.72,54.72,0,0,1,54.62,1H629.38A54.72,54.72,0,0,1,684,55.66V376.34A54.72,54.72,0,0,1,629.38,431ZM54.62,16A39.7,39.7,0,0,0,15,55.66V376.34A39.7,39.7,0,0,0,54.62,416H629.38A39.7,39.7,0,0,0,669,376.34V55.66A39.7,39.7,0,0,0,629.38,16Z"
            />
            {/* <path className="cls-2" d="M624.14,61.36v40.4H482.47V61.36Z" />
            <path className="cls-1" d="M351,330.8v40.4H59.66V330.8Z" /> */}
            <path className="cls-1" d="M159,100.84V180H59.93V100.84Z" />
            {dots > 0 && <circle className="cls-2" cx="80" cy="351" r="20" />}
            {dots > 1 && <circle className="cls-2" cx="150" cy="351" r="20" />}
            {dots > 2 && <circle className="cls-2" cx="220" cy="351" r="20" />}
          </SVG>
        </SvgContainer>
        <CardSetupForm
          client_profile={clientProfile}
          onChange={(event) =>
            setDots(
              event.empty
                ? 0
                : event.complete
                ? 3
                : event.brand === 'unknown'
                ? 1
                : 2,
            )
          }
        />
      </Wrapper>
    </Elements>
  );
};
