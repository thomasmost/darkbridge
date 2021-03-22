import React from 'react';

import { Link, RouteComponentProps, useNavigate } from '@reach/router';
import { AppointmentAttributes } from '../../models/appointment.model';
import { IInvoicePostBody } from '../../shared/invoice.dto';
import { ClientCard } from '../components/ClientCard';
import { Card } from '../elements/Card';
import styled from '@emotion/styled';
import { theme } from '../theme';

type PaymentSuccessProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  invoice: IInvoicePostBody | null;
};

const StyledCard = styled(Card)`
  margin-top: 50px;
  display: flex;
  justify-content: space-between;
  span {
    font-weight: 600;
    color: ${theme.buttonColorPassive};
  }
`;

const Instructions = styled.div`
  margin-top: 50px;
  font-size: 1.2em;
  line-height: 2em;
`;

const SkipLink = styled(Link)`
  color: ${theme.buttonColorPassive};
  display: block;
  margin-top: 50px;
  text-align: center;
  width: 100%;
`;

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  appointment,
  invoice,
}) => {
  const navigate = useNavigate();
  if (!invoice) {
    navigate('invoice');
    return null;
  }
  const {
    minutes_billed,
    hourly_rate,
    processing_fee,
    invoice_items,
    payment_method,
  } = invoice;
  const hourlyTotalInMinorUnits = ((hourly_rate * minutes_billed) / 60) * 100;
  const total_from_items = (invoice_items || []).reduce<number>(
    (item_total, item) =>
      item_total + item.amount_in_minor_units * item.quantity,
    0,
  );

  const total = (
    (hourlyTotalInMinorUnits + processing_fee + total_from_items) /
    100
  ).toFixed(2);

  // const onSubmit = async () => {
  //   invoice.appointment_id = appointment.id;
  //   const { error } = await apiRequest('invoice', 'json', {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //     method: 'POST',
  //     body: JSON.stringify(invoice),
  //   });
  //   if (!error) {
  //     navigate('success');
  //   }
  // };

  let clientCard: JSX.Element | null = null;
  if (appointment.client_profile) {
    clientCard = <ClientCard client={appointment.client_profile} />;
  }

  return (
    <div>
      {clientCard}
      <StyledCard>
        <strong>Charged</strong>
        <span>${total}</span>
      </StyledCard>
      <Instructions>
        Nice work! {appointment.client_profile?.full_name.split(' ')[0]} has
        been emailed a receipt
        {payment_method === 'credit_card' && ' and their card has been charged'}
        .
      </Instructions>
      <SkipLink to="/">Skip rating</SkipLink>
    </div>
  );
};
