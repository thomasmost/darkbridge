import React from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import { AppointmentAttributes } from '../../models/appointment.model';
import { Button } from '../elements/Button';
import { Label } from '../elements/Label';
import { InvoiceSection } from '../components/InvoiceSection';
import styled from '@emotion/styled';
import { IInvoicePostBody } from '../../shared/invoice.dto';
import { theme } from '../theme';
import { apiRequest } from '../services/api.svc';

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

type InvoiceReviewProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  invoice: IInvoicePostBody | null;
};

export const InvoiceReview: React.FC<InvoiceReviewProps> = ({
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
    minutes_billed,
    hourly_rate,
    processing_fee,
    invoice_items,
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

  const onSubmit = async () => {
    invoice.appointment_id = appointment.id;
    invoice.currency_code = 'USD';
    invoice.invoice_items = invoice.invoice_items || [];
    const { error } = await apiRequest('invoice', 'json', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(invoice),
    });
    if (!error) {
      navigate('success');
    }
  };

  return (
    <div>
      <Label>Breakdown</Label>
      <InvoiceSection
        readonly
        label="Standard hourly"
        total={(hourlyTotalInMinorUnits / 100).toFixed(2)}
      ></InvoiceSection>
      <InvoiceSection readonly label="Parts" total={'0.00'} />
      <InvoiceSection readonly label="Taxes" total={'0.00'} />
      <InvoiceSection
        readonly
        label="Processing Fee"
        total={'0.00'}
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

      <Button onClick={onSubmit}>Confirm Payment</Button>
      {/* </form> */}
    </div>
  );
};
