import React from 'react';
import { useStripe } from '@stripe/react-stripe-js';

import { CardEntryChangeEvent, CardSection } from './CardSection';
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
    width: 100%;
    border-radius: 4px;
  }
`;

export const CardSetupForm: React.FC<
  {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
  } & CardEntryChangeEvent
> = ({ onSubmit, onChange }) => {
  const stripe = useStripe();
  return (
    <StyledCardForm onSubmit={onSubmit}>
      <CardSection onChange={onChange} />
      <button disabled={!stripe}>Save Card</button>
    </StyledCardForm>
  );
};
