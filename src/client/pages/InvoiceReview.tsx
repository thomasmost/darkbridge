import React from 'react';

import { RouteComponentProps, useNavigate } from '@reach/router';
import { AppointmentAttributes } from '../../models/appointment.model';
import { InvoiceCreationAttributes } from '../../models/invoice.model';
import { Button } from '../elements/Button';
import { Label } from '../elements/Label';
import { InvoiceSection } from '../components/InvoiceSection';

// const InvoiceSectionHeader = styled.div`
//   font-weight: 600;
//   font-size: 1em;
//   display: flex;
//   justify-content: space-between;
//   padding: 15px 20px;
//   cursor: pointer;
//   * {
//     cursor: pointer;
//   }
//   span {
//     color: ${theme.lightIconColor};
//   }
// `;

type InvoiceReviewProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  invoice: InvoiceCreationAttributes | null;
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
  const { payment_method, minutes_billed, hourly_rate } = invoice;
  const hourlyTotal = ((hourly_rate * minutes_billed) / 60).toFixed(2);

  // const onSubmit = async (values: FormValues) => {
  //   navigate();
  // };

  const onSubmit = () => alert(JSON.stringify(invoice));

  return (
    <div>
      <Label>Breakdown</Label>
      <InvoiceSection
        readonly
        label="Standard hourly"
        total={hourlyTotal}
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

      <Button onClick={onSubmit}>Confirm Payment</Button>
      {/* </form> */}
    </div>
  );
};
