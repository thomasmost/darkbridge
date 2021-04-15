import React from 'react';

import { NavigateFn, RouteComponentProps, useNavigate } from '@reach/router';
import { AppointmentAttributes } from '../../models/appointment.model';
import { Button } from '../elements/Button';
import { Label } from '../elements/Label';
import { InvoiceSection } from '../components/InvoiceSection';
import styled from '@emotion/styled';
import { IInvoicePostBody } from '../../shared/invoice.dto';
import { theme } from '../theme';
import { postRequest } from '../services/api.svc';
import { InvoiceItemType, InvoiceStatus } from '../../shared/enums';
import { toMajorUnits } from '../../helpers/currency.helper';
import { InvoiceAttributes } from '../../models/invoice.model';

const InfoContainer = styled.div`
  margin: ${theme.pad(4)};
  * {
    line-height: 2em;
    font-weight: 600;
    span {
      color: ${theme.buttonColorPassive};
    }
  }
`;

const CardDetailsEntryMessage = styled.div`
  padding: ${theme.pad(4)};
  border-radius: 10px;
  background-color: ${theme.blockColorDefault};
  * {
    line-height: 2em;
    font-weight: 600;
  }
`;

type InvoiceReviewProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  invoice: IInvoicePostBody | null;
  setInvoice: (invoice: InvoiceAttributes) => void;
  includeTaxes: boolean;
};

const onSubmit = async (
  invoice: IInvoicePostBody,
  setInvoice: (invoice: InvoiceAttributes) => void,
  navigate: NavigateFn,
) => {
  invoice.invoice_items = invoice.invoice_items || [];
  const { /*error,*/ data } = await postRequest<InvoiceAttributes>(
    'invoice',
    'json',
    invoice,
  );
  if (data) {
    setInvoice(data);
    if (data?.status === InvoiceStatus.paid) {
      navigate('success');
    } else {
      navigate('add-card');
    }
  }
};

export const InvoiceReview: React.FC<InvoiceReviewProps> = ({
  appointment,
  invoice,
  setInvoice,
  includeTaxes,
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
  const total = (
    (time_total + materials_total + processing_fee + tax_total) /
    100
  ).toFixed(2);
  const show_card_entry_warning =
    payment_method === 'credit_card' &&
    !appointment.client_profile?.has_primary_payment_method;
  return (
    <div>
      <Label>Breakdown</Label>
      <InvoiceSection
        readonly
        label="Time"
        total={toMajorUnits(time_total)}
      ></InvoiceSection>
      <InvoiceSection
        readonly
        label="Materials"
        total={toMajorUnits(materials_total)}
      />
      <InvoiceSection
        zeroed={!includeTaxes}
        readonly
        label="Taxes"
        total={toMajorUnits(tax_total)}
      />
      <InvoiceSection
        readonly
        label="Processing Fee"
        total={toMajorUnits(processing_fee)}
        disabled={payment_method === 'cash'}
      >
        <Label>
          For digital payments, we add a small processing fee to cover solution
          and service costs. The fee is added to the total incurred by the
          client, so that the amount you receive stays the same. For more
          information, see our Terms of Service.
        </Label>
      </InvoiceSection>
      <InfoContainer>
        <label>
          Total: <span>${total}</span>
        </label>
        <div>Paid by {payment_method === 'cash' ? 'cash' : 'card'}</div>
      </InfoContainer>
      {show_card_entry_warning && (
        <CardDetailsEntryMessage>
          <label>
            You&apos;ll need to enter the client&apos;s card info on the next
            screen.
          </label>
        </CardDetailsEntryMessage>
      )}
      <Button onClick={() => onSubmit(invoice, setInvoice, navigate)}>
        Confirm Payment
      </Button>
    </div>
  );
};
