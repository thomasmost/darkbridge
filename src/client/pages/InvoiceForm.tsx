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
import { AppointmentAttributes } from '../../models/appointment.model';

import { Button } from '../elements/Button';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { IInvoiceFormValues, IInvoicePostBody } from '../../shared/invoice.dto';
import { Input } from '../elements/Input';
import { InvoiceDailyFormSection } from '../components/InvoiceDailyFormSection';
import { InvoiceHourlyFormSection } from '../components/InvoiceHourlyFormSection';
import { InvoiceItemPostBody } from '../../models/invoice_item.model';
import { InvoiceItemType, InvoicePaymentMethod } from '../../shared/enums';
import { InvoiceSection } from '../components/InvoiceSection';
import { InvoiceTaxesFormSection } from '../components/InvoiceTaxesFormSection';
import { Label } from '../elements/Label';
import { PrefixedInputContainer } from '../elements/PrefixedInputContainer';
import { theme } from '../theme';
import { TimeCard } from '../components/TimeCard';
import {
  ILineItem,
  InvoiceMaterialsFormSection,
} from '../components/InvoiceMaterialsFormSection';
import { ToggleContainer } from '../elements/ToggleContainer';

type InvoiceFormProps = RouteComponentProps & {
  appointment: AppointmentAttributes;
  invoice: IInvoicePostBody | null;
  setInvoice: Dispatch<SetStateAction<IInvoicePostBody | null>>;
  billingMethod: 'hourly' | 'daily';
  setBillingMethod: (method: 'hourly' | 'daily') => void;
  includeAppointmentFee: boolean;
  setIncludeAppointmentFee: (bool: boolean) => void;
  includeTaxes: boolean;
  setIncludeTaxes: (bool: boolean) => void;
};

const AppointmentFeeContainer = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 20px;
  width: 100%;
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

const costBreakdownInMinorUnits = (
  flat_rate = 0,
  hourly_rate = 0,
  minutes_billed = 0,
  daily_rate = 0,
  days_billed = 0,
  materials_total = 0,
  state_tax_rate: number,
  local_tax_rate: number,
  includeTaxes = true,
  exclude_processing_fee = false,
) => {
  const hourlyTotal = Math.ceil((hourly_rate * minutes_billed) / 60);
  const dailyTotal = Math.ceil(daily_rate * days_billed);
  const preTaxTotal = hourlyTotal + dailyTotal + flat_rate + materials_total;
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

const createMaterialsItem = (
  amount_in_minor_units: number,
  description: string,
  quantity: number,
) => ({
  type: InvoiceItemType.materials,
  amount_in_minor_units,
  description,
  quantity,
  currency_code: 'USD',
  metadata: {},
});

const submitHandler = (
  values: IInvoiceFormValues,
  appointment: AppointmentAttributes,
  materials: InvoiceItemPostBody[],
  stateTaxInfo: StateTaxInfo | undefined,
  includeTaxes: boolean,
  setInvoice: (invoice_draft: IInvoicePostBody) => void,
  navigate: (location: string) => void,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const appointment_id = appointment.id;
  const materials_total = materials.reduce<number>((subtotal, item) => {
    subtotal += item.amount_in_minor_units * item.quantity;
    return subtotal;
  }, 0);
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
    materials_total,
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
  if (materials && Array.isArray(materials)) {
    invoice_items.push(...materials);
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

type Register = UseFormMethods['register'];

const renderAppointmentFeeControls = (register: Register) => (
  <AppointmentFeeContainer>
    <Label style={{ margin: '0', width: '15%' }}>Appointment Fee</Label>
    <PrefixedInputContainer>
      $
      <Input
        style={{ margin: '0' }}
        name="flat_rate_in_major_units"
        ref={register}
        min="0"
        type="number"
      />
    </PrefixedInputContainer>
  </AppointmentFeeContainer>
);

const renderAppointmentFeeToggle = (
  includeAppointmentFee: boolean,
  setIncludeAppointmentFee: (bool: boolean) => void,
) => (
  <a href="#" onClick={() => setIncludeAppointmentFee(!includeAppointmentFee)}>
    {includeAppointmentFee ? '- Appointment Fee' : '+ Appointment Fee'}
  </a>
);

const renderHourlyControls = (
  register: Register,
  includeAppointmentFee: boolean,
  setIncludeAppointmentFee: (bool: boolean) => void,
  setBillingMethod: (method: 'hourly' | 'daily') => void,
) => (
  <>
    <InvoiceHourlyFormSection register={register} />
    <SectionControls>
      {renderAppointmentFeeToggle(
        includeAppointmentFee,
        setIncludeAppointmentFee,
      )}
      <a href="#" onClick={() => setBillingMethod('daily')}>
        Bill Daily
      </a>
    </SectionControls>
  </>
);

const renderDailyControls = (
  register: Register,
  includeAppointmentFee: boolean,
  setIncludeAppointmentFee: (bool: boolean) => void,
  setBillingMethod: (method: 'hourly' | 'daily') => void,
) => (
  <>
    <InvoiceDailyFormSection register={register} />
    <SectionControls>
      {renderAppointmentFeeToggle(
        includeAppointmentFee,
        setIncludeAppointmentFee,
      )}
      <a href="#" onClick={() => setBillingMethod('hourly')}>
        Bill Hourly
      </a>
    </SectionControls>
  </>
);

const useInvoiceForm = (
  appointment: AppointmentAttributes,
  draftInvoice: IInvoicePostBody | null,
  taxInfoForState: StateTaxInfo | undefined,
  billingMethod: 'daily' | 'hourly',
) => {
  const suggested_state_tax_rate = taxInfoForState?.state_sales_tax;
  const suggested_local_tax_rate = taxInfoForState?.avg_local_sales_tax;
  const start = new Date(appointment.started_at);
  const completed = new Date(appointment.completed_at);
  const secondsLogged = Math.abs(
    DateTimeHelper.differenceInSeconds(start, completed),
  );
  const minutesLogged = Math.ceil(secondsLogged / 60);
  if (draftInvoice) {
    return useForm<IInvoiceFormValues>({
      defaultValues: {
        ...draftInvoice,
      },
    });
  }
  return useForm<IInvoiceFormValues>({
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
};

// eslint-disable-next-line max-lines-per-function
export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  appointment,
  setInvoice,
  invoice,
  billingMethod,
  setBillingMethod,
  includeAppointmentFee,
  setIncludeAppointmentFee,
  includeTaxes,
  setIncludeTaxes,
  // eslint-disable-next-line sonarjs/cognitive-complexity
}) => {
  const navigate = useNavigate();
  const taxes = useMemo(() => stateTaxes(), []);
  const [materialsTotal, setMaterialsTotal] = useState(0);
  const [materialsItems, setMaterialsItems] = useState<InvoiceItemPostBody[]>(
    [],
  );
  const taxInfoForState = taxes.find(
    (taxDef) => taxDef.state === appointment.client_profile?.address_state,
  );
  let taxErrorMessage;
  if (!taxInfoForState) {
    taxErrorMessage = 'Failed to load suggested tax rates for this location';
  }
  const start = new Date(appointment.started_at);
  const completed = new Date(appointment.completed_at);
  const secondsLogged = Math.abs(
    DateTimeHelper.differenceInSeconds(start, completed),
  );
  const { register, handleSubmit, setValue, watch } = useInvoiceForm(
    appointment,
    invoice,
    taxInfoForState,
    billingMethod,
  );
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
    materialsTotal,
    state_tax_rate,
    local_tax_rate,
    includeTaxes,
  );
  const timeTotal =
    (billingMethod === 'hourly' ? hourlyTotal : dailyTotal) +
    coalesceToMinorUnits(flat_rate_in_major_units);
  const onSubmit = async (values: IInvoiceFormValues) =>
    submitHandler(
      values,
      appointment,
      materialsItems,
      taxInfoForState,
      includeTaxes,
      setInvoice,
      navigate,
    );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue('payment_method', event.target.checked ? 'cash' : 'credit_card');
  };
  const setMaterials = (materials: ILineItem[]) => {
    let total = 0;
    const materialItems = [];
    for (const material of materials) {
      total += material.amount_in_minor_units * material.quantity;
      const { amount_in_minor_units, description, quantity } = material;
      materialItems.push(
        createMaterialsItem(amount_in_minor_units, description, quantity),
      );
    }
    setMaterialsTotal(total);
    setMaterialsItems(materialItems);
  };
  return (
    <div>
      <TimeCard secondsLogged={secondsLogged} />
      <Label>Breakdown</Label>
      <InvoiceSection label="Time" total={toMajorUnits(timeTotal)}>
        {includeAppointmentFee && renderAppointmentFeeControls(register)}
        {billingMethod === 'hourly' &&
          renderHourlyControls(
            register,
            includeAppointmentFee,
            setIncludeAppointmentFee,
            setBillingMethod,
          )}
        {billingMethod === 'daily' &&
          renderDailyControls(
            register,
            includeAppointmentFee,
            setIncludeAppointmentFee,
            setBillingMethod,
          )}
      </InvoiceSection>
      <InvoiceSection label="Materials" total={toMajorUnits(materialsTotal)}>
        <InvoiceMaterialsFormSection setMaterials={setMaterials} />
      </InvoiceSection>
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
          <Switch
            color="primary"
            checked={payment_method === 'cash'}
            onChange={handleChange}
          />
        </div>
      </ToggleContainer>
      <Button onClick={handleSubmit(onSubmit)}>Proceed to Payment</Button>
    </div>
  );
};
