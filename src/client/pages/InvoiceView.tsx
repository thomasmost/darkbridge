import React, { useEffect, useState } from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import { AppointmentAttributes } from '../../models/appointment.model';
import { Label } from '../elements/Label';
import { InvoiceSection } from '../components/InvoiceSection';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { InvoiceItemType } from '../../shared/enums';
import { toMajorUnits } from '../../helpers/currency.helper';
import { InvoiceAttributes } from '../../models/invoice.model';
import { apiRequest } from '../services/api.svc';
import { toast } from 'react-toastify';

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

type InvoiceViewProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
};

export const InvoiceView: React.FC<InvoiceViewProps> = ({ appointment }) => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceAttributes | null>(null);
  if (!appointment.invoice_id) {
    navigate('invoice');
    return null;
  }

  useEffect(() => {
    if (!appointment.invoice_id) {
      return;
    }
    apiRequest(`invoice/${appointment.invoice_id}`, 'json').then((result) => {
      if (result.error) {
        toast.error(result.error);
      }
      setInvoice(result.data);
    });
  }, []);

  if (!invoice) {
    return <div>Loading...</div>;
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
  const includeTaxes = invoice_items.some(
    (item) => item.type === InvoiceItemType.tax,
  );
  const hourlyTotalInMinorUnits = (hourly_rate * minutes_billed) / 60;
  const dailyTotalInMinorUnits = daily_rate * days_billed;
  const timeTotal =
    hourlyTotalInMinorUnits + dailyTotalInMinorUnits + flat_rate;
  const total_from_items = (invoice_items || []).reduce<number>(
    (item_total, item) =>
      item_total + item.amount_in_minor_units * item.quantity,
    0,
  );

  const tax_total = invoice.invoice_items.reduce<number>((prev, item) => {
    if (item.type === InvoiceItemType.tax) {
      return prev + item.amount_in_minor_units;
    }
    return prev;
  }, 0);

  const total = ((timeTotal + processing_fee + total_from_items) / 100).toFixed(
    2,
  );

  return (
    <div>
      <Label>Breakdown</Label>
      <InvoiceSection
        readonly
        label="Time"
        total={toMajorUnits(timeTotal)}
      ></InvoiceSection>
      <InvoiceSection readonly label="Materials" total={'0.00'} />
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
      />

      <InfoContainer>
        <label>
          Total: <span>${total}</span>
        </label>
        <div>Paid by {payment_method === 'cash' ? 'cash' : 'card'}</div>
      </InfoContainer>
    </div>
  );
};
