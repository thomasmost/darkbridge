import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

import { CardEntryChangeEvent } from './CardSection';
import { toast } from 'react-toastify';
import { postRequest } from '../services/api.svc';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { CardSetupForm } from './CardSetupForm';

export const CardSetupOffSession: React.FC<
  {
    token: string;
    client_secret: string;
    client_profile: ClientProfileAttributes;
    onSuccess: () => void;
  } & CardEntryChangeEvent
> = ({ token, client_profile, client_secret, onChange, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isRequestPending, setRequestPending] = useState<boolean>(false);

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
    const result = await stripe.confirmCardSetup(client_secret, {
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
      const { setupIntent } = result;
      const add_res = await postRequest(
        'client_confirmation/add_payment_method',
        'text',
        {
          token,
          setupIntent,
        },
      );
      if (add_res.error) {
        toast.error(add_res.error);
        return;
      }
      onSuccess();
      // The setup has succeeded. Display a success message and send
      // result.setupIntent.payment_method to your server to save the
      // card to a Customer
    }
  };

  return (
    <CardSetupForm
      onChange={onChange}
      onSubmit={handleSubmit}
      submitText="Save Card"
    />
  );
};
