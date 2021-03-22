import styled from '@emotion/styled';
import Switch from '@material-ui/core/Switch';

import { navigate, RouteComponentProps, useNavigate } from '@reach/router';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { AppointmentAttributes } from '../../models/appointment.model';
import { InvoiceCreationAttributes } from '../../models/invoice.model';
import { InvoicePaymentMethod } from '../../shared/enums';
import { InvoiceSection } from '../components/InvoiceSection';
import { TimeCard } from '../components/TimeCard';
import { Button } from '../elements/Button';
import { Icon } from '../elements/Icon';
import { Input } from '../elements/Input';
import { Label } from '../elements/Label';
import { apiRequest } from '../services/api.svc';
import { theme } from '../theme';

const InvoiceSectionHeader = styled.div`
  font-weight: 600;
  font-size: 1em;
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  cursor: pointer;
  * {
    cursor: pointer;
  }
  span {
    color: ${theme.lightIconColor};
  }
`;

type InvoiceFormProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  setInvoice: Dispatch<SetStateAction<any>>;
};

type FormValues = {
  flat_rate: number;
  processing_fee: number;
  hourly_rate: number;
  daily_rate: number;
  minutes_billed: number;
  days_billed: number;
  payment_method: InvoicePaymentMethod;
};

const DollarInputContainer = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
`;
const ToggleContainer = styled.div`
  align-items: center;
  justify-content: space-around;
  display: flex;
  width: 100%;
  margin: 20px 0;
`;

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  appointment,
  setInvoice,
}) => {
  const navigate = useNavigate();
  // bit hacky
  const start = new Date(appointment.started_at || Date.now());
  const completed = new Date(appointment.completed_at || Date.now());
  const secondsLogged = Math.abs(
    DateTimeHelper.differenceInSeconds(start, completed),
  );

  const minutesLogged = Math.round(secondsLogged / 60);
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      minutes_billed: minutesLogged,
      hourly_rate: 50,
      payment_method: InvoicePaymentMethod.credit_card,
    },
  });
  // const navigate = useNavigate();
  useEffect(() => {
    register('payment_method');
  }, []);

  const {
    flat_rate,
    processing_fee,
    hourly_rate,
    daily_rate,
    minutes_billed,
    days_billed,
    payment_method,
  } = watch();

  const hourlyTotal = ((hourly_rate * minutes_billed) / 60).toFixed(2);

  const onSubmit = async (values: FormValues) => {
    setInvoice(values as any);
    navigate('review');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('payment_method', event.target.checked ? 'cash' : 'credit_card');
  };

  return (
    <div>
      <TimeCard secondsLogged={secondsLogged} />
      <Label>Breakdown</Label>
      <InvoiceSection label="Standard hourly" total={hourlyTotal}>
        <Label style={{ margin: '0', width: '66%' }}>Hourly Rate</Label>
        <DollarInputContainer>
          $
          <Input
            style={{ margin: '0' }}
            name="hourly_rate"
            ref={register}
            min="0"
            type="number"
          />
        </DollarInputContainer>
        <Label style={{ margin: '0', marginLeft: '20px', width: '66%' }}>
          Minutes Billed
        </Label>
        <Input
          style={{ margin: '0' }}
          name="minutes_billed"
          ref={register}
          min="0"
          type="number"
        />
      </InvoiceSection>
      <InvoiceSection label="Parts" total={'0.00'} />
      <InvoiceSection label="Taxes" total={'0.00'} />
      <InvoiceSection
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

      <ToggleContainer>
        <div>
          Paid in cash
          <Switch color="primary" onChange={handleChange} />
        </div>
      </ToggleContainer>
      <Button onClick={handleSubmit(onSubmit)}>Proceed to Payment</Button>
      {/* </form> */}
    </div>
  );
};
