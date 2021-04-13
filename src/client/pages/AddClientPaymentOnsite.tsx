import React from 'react';

import { NavigateFn, RouteComponentProps, useNavigate } from '@reach/router';
import { AppointmentAttributes } from '../../models/appointment.model';
import { Button } from '../elements/Button';
import styled from '@emotion/styled';
import { IInvoicePostBody } from '../../shared/invoice.dto';
import { theme } from '../theme';
import { postRequest } from '../services/api.svc';
import { InvoiceItemType, InvoicePaymentMethod } from '../../shared/enums';
import { toMajorUnits } from '../../helpers/currency.helper';

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

type AddClientPaymentOnsiteProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  invoice: IInvoicePostBody | null;
  includeTaxes: boolean;
};

const onSubmit = async (
  invoice: IInvoicePostBody,
  appointment: AppointmentAttributes,
  navigate: NavigateFn,
) => {
  if (
    invoice.payment_method === InvoicePaymentMethod.credit_card &&
    !appointment.client_profile?.has_primary_payment_method
  ) {
    navigate('add-payment');
    return;
  }
  invoice.invoice_items = invoice.invoice_items || [];
  const { error } = await postRequest('invoice', 'json', invoice);
  if (!error) {
    navigate('success');
  }
};

export const AddClientPaymentOnsite: React.FC<AddClientPaymentOnsiteProps> = ({
  appointment,
  invoice,
}) => {
  const navigate = useNavigate();
  if (!invoice) {
    navigate('invoice');
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
  return (
    <div>
      <InfoContainer>
        <label>
          Total: <span>${total}</span>
        </label>
        <div>Paid by {payment_method === 'cash' ? 'cash' : 'card'}</div>
      </InfoContainer>
      <Button onClick={() => onSubmit(invoice, appointment, navigate)}>
        Confirm Payment
      </Button>
    </div>
  );
};
