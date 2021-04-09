import React from 'react';
import { Link, RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { OnboardingNav, P } from '../elements/OnboardingElements';
import { postRequest } from '../services/api.svc';
import { toast } from 'react-toastify';
import { Label } from '../elements/Label';

const H3 = styled.h3`
  color: ${theme.darkModeTextColor};
  display: block;
  font-size: 1.4em;
  margin: 50px auto;
  text-align: center;
`;

const WrapperContainer = styled.div`
  margin: 100px 0;
  display: flex;
  justify-content: space-around;
  div > a {
    margin: auto;
    display: block;
    margin-bottom: 50px;
  }
  * {
    text-align: center;
  }
  p {
    margin: 20px 0;
  }
  label {
    margin-bottom: 50px;
  }
  a {
    color: ${theme.buttonColorPassive};
  }
`;

export const OnboardingBank: React.FC<RouteComponentProps> = () => {
  const navigate = useNavigate();

  const onSubmit = async () => {
    navigate('complete');
  };

  const createExpressAccount = async () => {
    const { data, error } = await postRequest<{ url: string }>(
      'stripe/onboard',
      'json',
    );
    if (error || !data) {
      toast.error(error);
      return;
    }
    const { url } = data;
    window.location.assign(url);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <WrapperContainer>
          <div>
            <H3>Teddy uses Stripe to link your bank.</H3>
            <a
              onClick={() => createExpressAccount()}
              href="#"
              className="stripe-connect white"
            >
              <span>Connect with</span>
            </a>
            <P>
              By connecting you agree to the Stripe{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://stripe.com/connect-account/legal"
              >
                Terms of Service
              </a>{' '}
              and end user{' '}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://stripe.com/privacy"
              >
                Privacy Policy
              </a>
              .
            </P>
            <Label>
              You can also skip this step and come back to it later, but we
              won&apos;t be able to pay you till you complete it!
            </Label>
            <Link to="/onboarding/complete">Skip and come back</Link>
          </div>
        </WrapperContainer>
        <OnboardingNav slideNumber={4} />
      </form>
    </div>
  );
};
