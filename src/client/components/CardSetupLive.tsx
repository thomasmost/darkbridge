import React, { useState } from 'react';
import { Switch } from '@material-ui/core';
import { useNavigate } from '@reach/router';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

import { CardEntryChangeEvent } from './CardSection';
import { postRequest } from '../services/api.svc';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { CardSetupForm } from './CardSetupForm';
import { ToggleContainer } from '../elements/ToggleContainer';

export const CardSetupLive: React.FC<
  {
    client_secret: string;
    invoice_id: string;
    client_profile: ClientProfileAttributes;
  } & CardEntryChangeEvent
> = ({ client_profile, client_secret, invoice_id, onChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isRequestPending, setRequestPending] = useState<boolean>(false);
  const [setup_future_usage, changeFutureUsage] = useState<boolean>(true);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements || isRequestPending) {
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

    setRequestPending(true);
    const result = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card,
        billing_details,
      },
    });
    setRequestPending(false);

    if (result.error) {
      toast.error(result.error.message);
    } else {
      toast.success('Card added!');
      const { paymentIntent } = result;
      const client_profile_id = client_profile.id;
      const add_res = await postRequest(
        'stripe/confirm_invoice_payment',
        'text',
        {
          client_profile_id,
          invoice_id,
          setup_future_usage,
          paymentIntent,
        },
      );
      if (add_res.error) {
        toast.error(add_res.error);
        return;
      }
      navigate('success');
      // The setup has succeeded. Display a success message and send
      // result.setupIntent.payment_method to your server to save the
      // card to a Customer
    }
  };

  return (
    <>
      <CardSetupForm
        onChange={onChange}
        onSubmit={handleSubmit}
        submitText="Submit Payment"
      />

      <ToggleContainer>
        <div>
          Save Card for Future Payments
          <Switch
            color="primary"
            checked={setup_future_usage}
            onChange={(event) => changeFutureUsage(event.target.checked)}
          />
        </div>
      </ToggleContainer>
    </>
  );
};
