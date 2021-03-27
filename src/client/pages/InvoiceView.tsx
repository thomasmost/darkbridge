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

const loadInvoice = async (
  appointment: AppointmentAttributes,
  setInvoice: (invoice: InvoiceAttributes) => void,
) => {
  if (!appointment.invoice_id) {
    return;
  }
  const { error, data } = await apiRequest(
    `invoice/${appointment.invoice_id}`,
    'json',
  );
  if (error) {
    toast.error(error);
  }
  setInvoice(data);
};

export const InvoiceView: React.FC<InvoiceViewProps> = ({ appointment }) => {
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceAttributes | null>(null);
  if (!appointment.invoice_id) {
    navigate('invoice');
    return null;
  }

  useEffect(() => {
    loadInvoice(appointment, setInvoice);
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
  const time_total =
    hourlyTotalInMinorUnits + dailyTotalInMinorUnits + flat_rate;

  const tax_total = invoice.invoice_items.reduce<number>((prev, item) => {
    if (item.type === InvoiceItemType.tax) {
      return prev + item.amount_in_minor_units;
    }
    return prev;
  }, 0);
  const materials_total = invoice.invoice_items.reduce<number>((prev, item) => {
    if (item.type === InvoiceItemType.materials) {
      return prev + item.amount_in_minor_units * item.quantity;
    }
    return prev;
  }, 0);
  const total = (
    (time_total + materials_total + processing_fee + tax_total) /
    100
  ).toFixed(2);
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
