import styled from '@emotion/styled';
import Switch from '@material-ui/core/Switch';

import { RouteComponentProps, useNavigate } from '@reach/router';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useForm, UseFormMethods } from 'react-hook-form';
import { stateTaxes, StateTaxInfo } from '../../data/taxes';
import {
  coalesceToMinorUnits,
  toMajorUnits,
} from '../../helpers/currency.helper';
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
  flat_rate_in_major_units: number;
  processing_fee: number;
  hourly_rate_in_major_units: number;
  daily_rate_in_major_units: number;
  minutes_billed: number;
  days_billed: number;
  payment_method: InvoicePaymentMethod;
  state_tax_rate: number;
  local_tax_rate: number;
};

const AppointmentFeeContainer = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 20px;
  width: 100%;
`;

const DollarInputContainer = styled.div`
  align-items: center;
  display: flex;
  width: 25%;
  input {
    margin-left: 10px;
  }
`;
const ToggleContainer = styled.div`
  align-items: center;
  justify-content: space-around;
  display: flex;
  width: 100%;
  margin: 20px 0;
`;

const SectionControls = styled.div`
  padding: 20px 0 10px;
  display: flex;
  width: 100%;
  a {
    background-color: ${theme.blockColorDefault};
    border-radius: 5px;
    color: ${theme.passiveLinkColor};
    margin-right: 20px;
    padding: 10px;
  }
  a:visited {
    color: ${theme.passiveLinkColor};
  }
`;

type Register = UseFormMethods['register'];
type FormSectionProps = {
  register: Register;
  error_message?: string;
};

const InvoiceHourlyFormSection: React.FC<FormSectionProps> = ({ register }) => {
  return (
    <>
      <Label style={{ margin: '0', width: '15%' }}>Hourly Rate</Label>
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
      <Label style={{ margin: '0', paddingLeft: '20px', width: '15%' }}>
        Minutes Billed
      </Label>
      <Input
        style={{ margin: '0', width: '25%' }}
        name="minutes_billed"
        ref={register}
        min="0"
        type="number"
      />
    </>
  );
};

const InvoiceDailyFormSection: React.FC<FormSectionProps> = ({ register }) => {
  return (
    <>
      <Label style={{ margin: '0', width: '15%' }}>Daily Rate</Label>
      <DollarInputContainer>
        $
        <Input
          style={{ margin: '0' }}
          name="daily_rate_in_major_units"
          ref={register}
          min="0"
          type="number"
        />
      </DollarInputContainer>
      <Label style={{ margin: '0', paddingLeft: '20px', width: '15%' }}>
        Days Billed
      </Label>
      <Input
        style={{ margin: '0', width: '25%' }}
        name="days_billed"
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
        <div style={{ color: theme.warningColor, width: '100%' }}>
          Failed to load suggested tax rates for this appointment
        </div>
      )}
      <Label style={{ margin: '0', width: '15%' }}>State Tax</Label>
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
      <Label style={{ margin: '0', marginLeft: '20px', width: '15%' }}>
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
  flat_rate = 0,
  hourly_rate = 0,
  minutes_billed = 0,
  daily_rate = 0,
  days_billed = 0,
  state_tax_rate: number,
  local_tax_rate: number,
  includeTaxes = true,
  exclude_processing_fee = false,
) => {
  const hourlyTotal = Math.ceil((hourly_rate * minutes_billed) / 60);
  const dailyTotal = Math.ceil(daily_rate * days_billed);
  const preTaxTotal = hourlyTotal + dailyTotal + flat_rate;
  const stateTaxTotal = includeTaxes
    ? Math.ceil((preTaxTotal * state_tax_rate) / 100)
    : 0;
  const localTaxTotal = includeTaxes
    ? Math.ceil((preTaxTotal * local_tax_rate) / 100)
    : 0;
  const taxTotal = stateTaxTotal + localTaxTotal;
  const postTaxTotal = preTaxTotal + taxTotal;
  const processing_fee = exclude_processing_fee
    ? 0
    : Math.ceil(postTaxTotal * 0.04);
  return {
    hourlyTotal,
    dailyTotal,
    preTaxTotal,
    stateTaxTotal,
    localTaxTotal,
    taxTotal,
    postTaxTotal,
    processing_fee,
  };
};

const createTaxItem = (
  description: string,
  suggested_rate: number | null,
  entered_rate: number,
  amount_in_minor_units: number,
  state: string | null,
) => ({
  type: InvoiceItemType.tax,
  amount_in_minor_units,
  description,
  quantity: 1,
  currency_code: 'USD',
  metadata: {
    suggested_tax_rate: suggested_rate,
    entered_tax_rate: entered_rate,
    state_of_suggested_tax_rate: state,
  },
});

const submitHandler = (
  values: FormValues,
  appointment_id: string,
  stateTaxInfo: StateTaxInfo | undefined,
  includeTaxes: boolean,
  setInvoice: (invoice_draft: IInvoicePostBody) => void,
  navigate: (location: string) => void,
) => {
  const { state_tax_rate, local_tax_rate } = values;
  const {
    stateTaxTotal,
    localTaxTotal,
    processing_fee,
  } = costBreakdownInMinorUnits(
    coalesceToMinorUnits(values.flat_rate_in_major_units),
    coalesceToMinorUnits(values.hourly_rate_in_major_units),
    values.minutes_billed,
    coalesceToMinorUnits(values.daily_rate_in_major_units),
    values.days_billed,
    state_tax_rate,
    local_tax_rate,
    includeTaxes,
    values.payment_method === 'cash',
  );
  const state = stateTaxInfo ? stateTaxInfo.state : null;
  const invoice_items: InvoiceItemPostBody[] = [];
  if (state_tax_rate) {
    invoice_items.push(
      createTaxItem(
        'State Sales Tax',
        stateTaxInfo ? stateTaxInfo.state_sales_tax : null,
        state_tax_rate,
        stateTaxTotal,
        state,
      ),
    );
  }
  if (local_tax_rate) {
    invoice_items.push(
      createTaxItem(
        'Local Sales Tax',
        stateTaxInfo ? stateTaxInfo.avg_local_sales_tax : null,
        local_tax_rate,
        localTaxTotal,
        state,
      ),
    );
  }
  const currency_code = 'USD';
  const hourly_rate = coalesceToMinorUnits(values.hourly_rate_in_major_units);
  const daily_rate = coalesceToMinorUnits(values.daily_rate_in_major_units);
  const flat_rate = coalesceToMinorUnits(values.flat_rate_in_major_units);
  const invoiceDraft: IInvoicePostBody = {
    ...values,
    minutes_billed: values.minutes_billed || 0,
    days_billed: values.days_billed || 0,
    flat_rate,
    daily_rate,
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
  //eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const navigate = useNavigate();
  const taxes = useMemo(() => stateTaxes(), []);
  const [billingMethod, setBillingMethod] = useState<string>('hourly');
  const [includeAppointmentFee, setIncludeAppointmentFee] = useState<boolean>(
    false,
  );
  const [includeTaxes, setIncludeTaxes] = useState<boolean>(true);
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
      hourly_rate_in_major_units: 50,
      minutes_billed: billingMethod === 'hourly' ? minutesLogged : 0,
      daily_rate_in_major_units: 200,
      days_billed: billingMethod === 'daily' ? 1 : 0,
      payment_method: InvoicePaymentMethod.credit_card,
      state_tax_rate: suggested_state_tax_rate,
      local_tax_rate: suggested_local_tax_rate,
    },
  });
  useEffect(() => {
    register('payment_method');
  }, []);
  const {
    flat_rate_in_major_units,
    hourly_rate_in_major_units,
    daily_rate_in_major_units,
    minutes_billed,
    days_billed,
    payment_method,
    state_tax_rate,
    local_tax_rate,
  } = watch();

  const {
    hourlyTotal,
    dailyTotal,
    taxTotal,
    processing_fee,
  } = costBreakdownInMinorUnits(
    coalesceToMinorUnits(flat_rate_in_major_units),
    coalesceToMinorUnits(hourly_rate_in_major_units),
    minutes_billed,
    coalesceToMinorUnits(daily_rate_in_major_units),
    days_billed,
    state_tax_rate,
    local_tax_rate,
    includeTaxes,
  );
  const timeTotal =
    (billingMethod === 'hourly' ? hourlyTotal : dailyTotal) +
    coalesceToMinorUnits(flat_rate_in_major_units);
  const onSubmit = async (values: FormValues) =>
    submitHandler(
      values,
      appointment.id,
      taxInfoForState,
      includeTaxes,
      setInvoice,
      navigate,
    );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('payment_method', event.target.checked ? 'cash' : 'credit_card');
  };
  const changeBillingMethod = (method: string) => {
    if (method === 'daily') {
      setBillingMethod('daily');
    }
    if (method === 'hourly') {
      setBillingMethod('hourly');
    }
  };
  return (
    <div>
      <TimeCard secondsLogged={secondsLogged} />
      <Label>Breakdown</Label>
      <InvoiceSection label="Time" total={toMajorUnits(timeTotal)}>
        {includeAppointmentFee && (
          <AppointmentFeeContainer>
            <Label style={{ margin: '0', width: '15%' }}>Appointment Fee</Label>
            <DollarInputContainer>
              $
              <Input
                style={{ margin: '0' }}
                name="flat_rate_in_major_units"
                ref={register}
                min="0"
                type="number"
              />
            </DollarInputContainer>
          </AppointmentFeeContainer>
        )}
        {billingMethod === 'hourly' && (
          <>
            <InvoiceHourlyFormSection register={register} />
            <SectionControls>
              <a
                href="#"
                onClick={() => setIncludeAppointmentFee(!includeAppointmentFee)}
              >
                {includeAppointmentFee
                  ? '- Appointment Fee'
                  : '+ Appointment Fee'}
              </a>
              <a href="#" onClick={() => changeBillingMethod('daily')}>
                Bill Daily
              </a>
            </SectionControls>
          </>
        )}
        {billingMethod === 'daily' && (
          <>
            <InvoiceDailyFormSection register={register} />
            <SectionControls>
              <a
                href="#"
                onClick={() => setIncludeAppointmentFee(!includeAppointmentFee)}
              >
                {includeAppointmentFee
                  ? '- Appointment Fee'
                  : '+ Appointment Fee'}
              </a>
              <a href="#" onClick={() => changeBillingMethod('hourly')}>
                Bill Hourly
              </a>
            </SectionControls>
          </>
        )}
      </InvoiceSection>
      <InvoiceSection label="Parts" total={'0.00'} />
      <InvoiceSection
        label="Taxes"
        zeroed={!includeTaxes}
        total={toMajorUnits(taxTotal)}
      >
        <InvoiceTaxesFormSection
          register={register}
          error_message={taxErrorMessage}
        />
        <SectionControls>
          <a href="#" onClick={() => setIncludeTaxes(!includeTaxes)}>
            {includeTaxes ? '- Taxes' : '+ Taxes'}
          </a>
        </SectionControls>
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
