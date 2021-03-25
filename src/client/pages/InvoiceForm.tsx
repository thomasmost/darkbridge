import styled from '@emotion/styled';
import Switch from '@material-ui/core/Switch';

import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import { useForm, UseFormMethods } from 'react-hook-form';
import { stateTaxes, StateTaxInfo } from '../../data/taxes';
import { toMajorUnits } from '../../helpers/currency.helper';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { AppointmentAttributes } from '../../models/appointment.model';
import { InvoiceItemPostBody } from '../../models/invoice_item.model';
import { InvoiceItemType, InvoicePaymentMethod } from '../../shared/enums';
import { IInvoicePostBody } from '../../shared/invoice.dto';
import { InvoiceSection } from '../components/InvoiceSection';
import { TimeCard } from '../components/TimeCard';
import { Button } from '../elements/Button';
import { Input } from '../elements/Input';
import { Label } from '../elements/Label';
import { theme } from '../theme';

type InvoiceFormProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  setInvoice: Dispatch<SetStateAction<IInvoicePostBody | null>>;
};

type FormValues = {
  flat_rate: number;
  processing_fee: number;
  hourly_rate_in_major_units: number;
  daily_rate: number;
  minutes_billed: number;
  days_billed: number;
  payment_method: InvoicePaymentMethod;
  state_tax_rate: number;
  local_tax_rate: number;
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

type Register = UseFormMethods['register'];
type FormSectionProps = {
  register: Register;
  error_message?: string;
};

const InvoiceHourlyFormSection: React.FC<FormSectionProps> = ({ register }) => {
  return (
    <>
      <Label style={{ margin: '0', width: '66%' }}>Hourly Rate</Label>
      <DollarInputContainer>
        $
        <Input
          style={{ margin: '0' }}
          name="hourly_rate_in_major_units"
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
    </>
  );
};

const InvoiceTaxesFormSection: React.FC<FormSectionProps> = ({
  register,
  error_message,
}) => {
  return (
    <>
      {Boolean(error_message) && (
        <div style={{ color: theme.warningColor }}>
          Failed to load suggested tax rates for this appointment
        </div>
      )}
      <Label style={{ margin: '0', width: '66%' }}>State Tax</Label>
      <DollarInputContainer>
        %
        <Input
          style={{ margin: '0' }}
          step="0.1"
          name="state_tax_rate"
          ref={register}
          min="0"
          type="number"
        />
      </DollarInputContainer>
      <Label style={{ margin: '0', marginLeft: '20px', width: '66%' }}>
        Local Tax
      </Label>
      <DollarInputContainer>
        %
        <Input
          style={{ margin: '0' }}
          step="0.1"
          name="local_tax_rate"
          ref={register}
          min="0"
          type="number"
        />
      </DollarInputContainer>
    </>
  );
};

const costBreakdownInMinorUnits = (
  hourly_rate: number,
  minutes_billed: number,
  state_tax_rate: number,
  local_tax_rate: number,
) => {
  const hourlyTotal = Math.ceil((hourly_rate * minutes_billed) / 60);
  const preTaxTotal = hourlyTotal;
  const stateTaxTotal = Math.ceil((preTaxTotal * state_tax_rate) / 100);
  const localTaxTotal = Math.ceil((preTaxTotal * local_tax_rate) / 100);
  const taxTotal = stateTaxTotal + localTaxTotal;
  const postTaxTotal = preTaxTotal + taxTotal;
  const processing_fee = Math.ceil(postTaxTotal * 0.04);
  return {
    hourlyTotal,
    preTaxTotal,
    stateTaxTotal,
    localTaxTotal,
    taxTotal,
    postTaxTotal,
    processing_fee,
  };
};

const submitHandler = (
  values: FormValues,
  appointment_id: string,
  stateTaxInfo: StateTaxInfo | undefined,
  setInvoice: (invoice_draft: IInvoicePostBody) => void,
  navigate: (location: string) => void,
) => {
  const { state_tax_rate, local_tax_rate } = values;
  const {
    stateTaxTotal,
    localTaxTotal,
    processing_fee,
  } = costBreakdownInMinorUnits(
    values.hourly_rate_in_major_units * 100,
    values.minutes_billed,
    state_tax_rate,
    local_tax_rate,
  );
  const invoice_items: InvoiceItemPostBody[] = [];
  if (state_tax_rate) {
    invoice_items.push({
      type: InvoiceItemType.tax,
      amount_in_minor_units: stateTaxTotal,
      description: 'State Sales Tax',
      quantity: 1,
      currency_code: 'USD',
      metadata: {
        suggested_tax_rate: stateTaxInfo ? stateTaxInfo.state_sales_tax : null,
        entered_tax_rate: state_tax_rate,
        state_of_suggested_tax_rate: stateTaxInfo ? stateTaxInfo.state : null,
      },
    });
  }
  if (local_tax_rate) {
    invoice_items.push({
      type: InvoiceItemType.tax,
      amount_in_minor_units: localTaxTotal,
      description: 'Local Sales Tax',
      quantity: 1,
      currency_code: 'USD',
      metadata: {
        suggested_tax_rate: stateTaxInfo
          ? stateTaxInfo.avg_local_sales_tax
          : null,
        entered_tax_rate: local_tax_rate,
        state_of_suggested_tax_rate: stateTaxInfo ? stateTaxInfo.state : null,
      },
    });
  }
  const currency_code = 'USD';
  const hourly_rate = values.hourly_rate_in_major_units * 100;
  const invoiceDraft: IInvoicePostBody = {
    ...values,
    hourly_rate,
    appointment_id,
    processing_fee,
    invoice_items,
    currency_code,
  };
  setInvoice(invoiceDraft);
  navigate('review');
};

// eslint-disable-next-line max-lines-per-function
export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  appointment,
  setInvoice,
}) => {
  const navigate = useNavigate();
  const taxes = useMemo(() => stateTaxes(), []);
  const taxInfoForState = taxes.find(
    (taxDef) => taxDef.state === appointment.client_profile?.address_state,
  );
  let taxErrorMessage;
  if (!taxInfoForState) {
    taxErrorMessage = 'Failed to load suggested tax rates for this location';
  }
  const suggested_state_tax_rate = taxInfoForState?.state_sales_tax;
  const suggested_local_tax_rate = taxInfoForState?.avg_local_sales_tax;
  // bit hacky
  const start = new Date(appointment.started_at || Date.now());
  const completed = new Date(appointment.completed_at || Date.now());
  const secondsLogged = Math.abs(
    DateTimeHelper.differenceInSeconds(start, completed),
  );
  const minutesLogged = Math.ceil(secondsLogged / 60);
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      minutes_billed: minutesLogged,
      hourly_rate_in_major_units: 50,
      payment_method: InvoicePaymentMethod.credit_card,
      state_tax_rate: suggested_state_tax_rate,
      local_tax_rate: suggested_local_tax_rate,
    },
  });
  useEffect(() => {
    register('payment_method');
  }, []);
  const {
    flat_rate,
    hourly_rate_in_major_units,
    daily_rate,
    minutes_billed,
    days_billed,
    payment_method,
    state_tax_rate,
    local_tax_rate,
  } = watch();

  const { hourlyTotal, taxTotal, processing_fee } = costBreakdownInMinorUnits(
    hourly_rate_in_major_units * 100,
    minutes_billed,
    state_tax_rate,
    local_tax_rate,
  );
  const onSubmit = async (values: FormValues) =>
    submitHandler(
      values,
      appointment.id,
      taxInfoForState,
      setInvoice,
      navigate,
    );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('payment_method', event.target.checked ? 'cash' : 'credit_card');
  };
  return (
    <div>
      <TimeCard secondsLogged={secondsLogged} />
      <Label>Breakdown</Label>
      <InvoiceSection label="Standard hourly" total={toMajorUnits(hourlyTotal)}>
        <InvoiceHourlyFormSection register={register} />
      </InvoiceSection>
      <InvoiceSection label="Parts" total={'0.00'} />
      <InvoiceSection label="Taxes" total={toMajorUnits(taxTotal)}>
        <InvoiceTaxesFormSection
          register={register}
          error_message={taxErrorMessage}
        />
      </InvoiceSection>
      <InvoiceSection
        label="Processing Fee"
        total={
          payment_method === 'cash' ? '0.00' : toMajorUnits(processing_fee)
        }
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
