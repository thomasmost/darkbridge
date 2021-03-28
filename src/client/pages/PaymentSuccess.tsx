import React, { useEffect, useState } from 'react';

import { Link, RouteComponentProps } from '@reach/router';
import { AppointmentAttributes } from '../../models/appointment.model';
import { IInvoiceCore, IInvoicePostBody } from '../../shared/invoice.dto';
import { ClientCard } from '../components/ClientCard';
import { Card } from '../elements/Card';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { InvoiceItemType } from '../../shared/enums';
import { loadInvoice } from '../services/invoice.svc';
import { putRequest } from '../services/api.svc';

type PaymentSuccessProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  invoice: IInvoicePostBody | null;
};

const StyledCard = styled(Card)`
  margin-top: ${theme.pad(10)};
  display: flex;
  justify-content: space-between;
  span {
    font-weight: 600;
    color: ${theme.buttonColorPassive};
  }
`;

const RatingCard = styled(Card)`
  background-color: ${theme.blockColorDefault};
  box-shadow: none;
  margin-top: ${theme.pad(4)};
  padding-top: ${theme.pad(8)};
  padding-bottom: ${theme.pad(8)};
  > * {
    display: block;
    text-align: center;
    margin: auto;
  }
  > p {
    padding-bottom: ${theme.pad(2)};
  }
  em {
    padding-bottom: ${theme.pad(8)};
  }
`;

const Prompt = styled.p`
  font-weight: 600;
  font-size: 1.4em;
  line-height: 1.5em;
`;

const Instructions = styled.div`
  margin-top: 50px;
  font-size: 1em;
  line-height: 2em;
`;

const SkipLink = styled(Link)`
  color: ${theme.buttonColorPassive};
  display: block;
  margin-top: ${theme.pad(8)};
  text-align: center;
  width: 100%;
`;

const StarContainer = styled.div`
  width: 200px;
  display: flex;
  justify-content: space-between;
`;

const renderStars = (rating = 0, setRating: (index: number) => void) => {
  const countStars = 5;
  const stars = [];
  for (let i = 0; i < countStars; i++) {
    stars.push(
      <svg
        width="30"
        height="28"
        viewBox="0 0 24 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onClick={() => setRating(i + 1)}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.2869 7.82925L15.7506 6.886L12.8309 1.00833C12.6582 0.717106 12.3432 0.53833 12.0029 0.53833C11.6625 0.53833 11.3476 0.717106 11.1749 1.00833L8.24966 6.886L1.71335 7.82925C1.36563 7.87909 1.07655 8.12062 0.967629 8.45232C0.858708 8.78401 0.948834 9.14834 1.20012 9.39216L5.93089 13.97L4.81489 20.4352C4.75556 20.7791 4.89795 21.1267 5.18221 21.3317C5.46647 21.5368 5.8433 21.5638 6.15427 21.4014L12.0001 18.3498L17.846 21.4014C18.1569 21.5638 18.5338 21.5368 18.818 21.3317C19.1023 21.1267 19.2447 20.7791 19.1854 20.4352L18.0694 13.97L22.8001 9.39216C23.0513 9.14859 23.1416 8.78459 23.0332 8.45301C22.9247 8.12142 22.6361 7.87966 22.2887 7.82925H22.2869Z"
          fill={rating > i ? theme.buttonColorPassive : 'white'}
        />
      </svg>,
    );
  }
  return <StarContainer>{stars}</StarContainer>;
};

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  appointment,
  invoice,
}) => {
  const [loadedInvoice, setInvoice] = useState<IInvoiceCore | null>(invoice);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    loadInvoice(appointment, setInvoice);
  }, []);

  if (!loadedInvoice) {
    return null;
  }

  const {
    payment_method,
    flat_rate,
    minutes_billed,
    hourly_rate,
    daily_rate,
    days_billed,
    processing_fee,
    invoice_items,
  } = loadedInvoice;
  // const includeTaxes = invoice_items.some(
  //   (item) => item.type === InvoiceItemType.tax,
  // );
  const hourlyTotalInMinorUnits = (hourly_rate * minutes_billed) / 60;
  const dailyTotalInMinorUnits = daily_rate * days_billed;
  const time_total =
    hourlyTotalInMinorUnits + dailyTotalInMinorUnits + flat_rate;

  const tax_total = invoice_items.reduce<number>((prev, item) => {
    if (item.type === InvoiceItemType.tax) {
      return prev + item.amount_in_minor_units;
    }
    return prev;
  }, 0);
  const materials_total = invoice_items.reduce<number>((prev, item) => {
    if (item.type === InvoiceItemType.materials) {
      return prev + item.amount_in_minor_units * item.quantity;
    }
    return prev;
  }, 0);
  const total = (
    (time_total + materials_total + processing_fee + tax_total) /
    100
  ).toFixed(2);

  let clientCard: JSX.Element | null = null;
  if (appointment.client_profile) {
    clientCard = <ClientCard client={appointment.client_profile} />;
  }

  const recordRating = async (rating: number) => {
    await putRequest(`appointment/${appointment.id}/rate_client`, 'text', {
      rating,
    });
    setRating(rating);
  };

  return (
    <div>
      {clientCard}
      <StyledCard>
        <strong>Charged</strong>
        <span>${total}</span>
      </StyledCard>
      <Instructions>
        Nice work! {appointment.client_profile?.given_name} has been emailed a
        receipt
        {payment_method === 'credit_card' && ' and their card has been charged'}
        .
      </Instructions>
      <RatingCard>
        <Prompt>
          How was your experience working with{' '}
          {appointment.client_profile?.given_name}?
        </Prompt>
        <em>This rating will not be shared with the client.</em>
        {renderStars(rating, recordRating)}
      </RatingCard>
      <SkipLink to="/">{rating === 0 ? 'Skip rating' : 'Return home'}</SkipLink>
    </div>
  );
};
