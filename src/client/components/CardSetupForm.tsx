import React from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

import { CardEntryChangeEvent, CardSection } from './CardSection';
import { toast } from 'react-toastify';
import { postRequest } from '../services/api.svc';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import styled from '@emotion/styled';
import { theme } from '../theme';

const StyledCardForm = styled.form`
  box-sizing: border-box;
  .StripeElement {
    height: 40px;
    padding: 10px 12px;
    width: 100%;
    color: #32325d;
    background-color: white;
    border: 1px solid transparent;
    border-radius: 4px;
    box-shadow: 0 1px 3px 0 #e6ebf1;
    box-sizing: border-box;
    -webkit-transition: box-shadow 150ms ease;
    transition: box-shadow 150ms ease;
  }
  .StripeElement--focus {
    box-shadow: 0 1px 3px 0 #cfd7df;
  }
  .StripeElement--invalid {
    border-color: #fa755a;
  }
  .StripeElement--webkit-autofill {
    background-color: #fefde5 !important;
  }
  label {
    display: block;
    line-height: 3em;
  }
  button {
    margin-top: ${theme.pad(2)};
    padding: ${theme.pad(2)};
  }
`;

export const CardSetupForm: React.FC<
  {
    client_profile: ClientProfileAttributes;
  } & CardEntryChangeEvent
> = ({ client_profile, onChange }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      toast.error('Missing card');
      return;
    }
    const billing_details = {
      name: client_profile.full_name,
    };

    const result = await stripe.confirmCardSetup('{{CLIENT_SECRET}}', {
      payment_method: {
        card,
        billing_details,
      },
    });

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success('Card added!');
      const { setupIntent } = result;
      postRequest('stripe/add_payment_method', 'json', {
        setupIntent,
      });
      // The setup has succeeded. Display a success message and send
      // result.setupIntent.payment_method to your server to save the
      // card to a Customer
    }
  };

  return (
    <StyledCardForm onSubmit={handleSubmit}>
      <CardSection onChange={onChange} />
      <button disabled={!stripe}>Save Card</button>
    </StyledCardForm>
  );
};
