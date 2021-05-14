import React from 'react';

import { RouteComponentProps } from '@reach/router';
import { AppointmentAttributes } from '../../models/appointment.model';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { InvoiceItemType } from '../../shared/enums';
import { toMajorUnits } from '../../helpers/currency.helper';
import { InvoiceAttributes } from '../../models/invoice.model';

const InfoContainer = styled.div`
  margin: 20px;
  * {
    line-height: 2em;
    font-weight: 600;
    span {
      color: ${theme.buttonColorPassive};
    }
  }
`;

type AwaitingPaymentScreenProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  invoice: InvoiceAttributes | null;
  includeTaxes: boolean;
};

export const AwaitingPaymentScreen: React.FC<AwaitingPaymentScreenProps> = ({
  appointment,
  invoice,
}) => {
  if (!invoice) {
    throw Error('Must have an invoice by this stage');
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
    client_secret,
  } = invoice;
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
  const total = toMajorUnits(
    time_total + materials_total + processing_fee + tax_total,
  );

  const clientProfile = appointment.client_profile;

  if (!clientProfile || !client_secret || !invoice) {
    return <div>Loading...</div>;
  }

  if (!invoice.id) {
    throw Error('should not happen at this point; need to fix typings');
  }

  return (
    <div>
      <InfoContainer>
        <label>
          Total: <span>${total}</span>
        </label>
        <div>Paid by {payment_method === 'cash' ? 'cash' : 'card'}</div>
      </InfoContainer>
      <div>
        A request has been sent to the client to enter their card details.
        Please leave the app open until they do.
      </div>
      {/* <Button onClick={() => onSubmit(invoice, appointment, navigate)}>
        Confirm Payment
      </Button> */}
    </div>
  );
};