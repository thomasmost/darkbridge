/**
 * Use the CSS tab above to style your Element's container.
 */
import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';
// import './Styles.css';
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

export type StripeCardChangeEvent = {
  elementType: 'card';
  empty: boolean;
  complete: boolean;
  brand: string;
};

export type CardEntryChangeEvent = {
  onChange: (data: StripeCardChangeEvent) => void;
};

// Test the form with 4242 4242 4242 4242

export const CardSection: React.FC<CardEntryChangeEvent> = ({ onChange }) => (
  <label>
    Card details
    <CardElement options={CARD_ELEMENT_OPTIONS} onChange={onChange} />
  </label>
);
