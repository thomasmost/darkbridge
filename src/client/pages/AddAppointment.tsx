import styled from '@emotion/styled';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Accordion from '@material-ui/core/Accordion';
import {
  AppointmentAttributes,
  IAppointmentPostBody,
} from '../../models/appointment.model';
import { useAuth } from '../AuthProvider';
import { FlexColumns } from '../elements/FlexColumns';
import { Input } from '../elements/Input';
import { theme } from '../theme';
import AsyncSelect from 'react-select/async';
// import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import { DateTimePicker } from '@material-ui/pickers';
import { Styles } from 'react-select';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { getRequest, postRequest } from '../services/api.svc';
import { Select } from '../components/Select';
import { Button } from '../elements/Button';
import { DateTimeHelper } from '../../helpers/datetime.helper';
import { useBlockingRequest } from '../useBlockingRequest';

interface IFormValues extends Omit<IAppointmentPostBody, 'duration_minutes'> {
  duration_hours: number;
}

const Label = styled.label`
  color: ${theme.subheaderTextColor};
  display: block;
  margin-bottom: 10px;
`;

const priorityOptions = [
  {
    label: 'Emergency (P0)',
    value: 'P0',
  },
  {
    label: 'Urgent (P1)',
    value: 'P1',
  },
  {
    label: 'Earliest Convenience (P2)',
    value: 'P2',
  },
  {
    label: 'Discretionary (P3)',
    value: 'P3',
  },
];

const StyledAccordion = styled(Accordion)`
  box-shadow: none !important;
  &:before {
    background-color: none !important;
    height: 0 !important;
  }
`;

const StyledPicker = styled(DateTimePicker)`
  div {
    input {
      border-radius: 10px;
      box-sizing: border-box;
      display: block;
      padding: 22px 20px 23px;
      width: 100%;
      background-color: ${theme.inputBackgroundColor};
      font-family: 'Circular Std', Helvetica, sans-serif;
    }
    min-width: 240px;
  }
`;

const InfoBlock = styled.div`
  border-radius: 10px;
  background-color: ${theme.inputBackgroundColor}; //#daedfd;
  color: ${theme.applicationTextColor};
  padding: 10px 20px;
  margin: 10px 0 20px;
  line-height: 1.5em;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectStyles: Styles<any, false> = {
  container: (provided) => ({
    ...provided,
    cursor: 'pointer',
  }),
  control: (provided, props) => ({
    ...provided,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '5px 10px',
    marginBottom: '20px',
    backgroundColor: theme.inputBackgroundColor,
    boxShadow: props.isFocused ? '4px 4px #23C38A' : 'none',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: 'none',
  }),
  option: (provided, option) => ({
    ...provided,
    cursor: 'pointer',
    fontStyle: option.label === 'Add a New Client' ? 'italic' : 'normal',
  }),
};

const loadOptions = async (name: string) => {
  const response = await getRequest<ClientProfileAttributes[]>(
    `client_profile?name=${name}`,
  );
  if (response.error) {
    return [];
  }
  const results = response.data;
  results.push({
    full_name: 'Add a New Client',
    id: '',
  } as ClientProfileAttributes);
  return results;
};

//eslint-disable-next-line max-lines-per-function
export const AddAppointment: React.FC<RouteComponentProps> = () => {
  const [selectedDate, setDate] = useState(new Date());
  const [
    selectedClient,
    setSelectedClient,
  ] = useState<ClientProfileAttributes | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<IFormValues>({
    defaultValues: {
      duration_hours: 1,
    },
  });
  const { blockFor, isRequestPending } = useBlockingRequest();
  useEffect(() => {
    register('client_profile_id');
    register('datetime_local');
    register('priority');
  }, [register]);
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const handleDateChange = (date: Date) => {
    setValue('datetime_local', DateTimeHelper.formatToPureDateTime(date));
    setDate(date);
  };
  const onSubmit = blockFor(async (values: IFormValues) => {
    const data = {
      ...values,
      duration_minutes: Math.ceil(values.duration_hours * 60),
    };
    const result = await postRequest<AppointmentAttributes, typeof data>(
      'appointment',
      'json',
      data,
    );
    if (!result.error) {
      toast.success('Appointment Created');
      navigate('/');
    }
    return result;
  });
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Label>Client</Label>
        <AsyncSelect
          getOptionLabel={(item) => item.full_name}
          getOptionValue={(item) => item.id}
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          styles={selectStyles}
          onChange={(selection) => {
            if (selection && selection.id === '') {
              navigate('/add-client');
              return;
            }
            setValue('client_profile_id', selection?.id);
            setSelectedClient(selection);
          }}
        />
        <StyledAccordion expanded={Boolean(selectedClient)}>
          <div />
          <Label>Address</Label>
          <InfoBlock>
            <div>{selectedClient?.address_street}</div>
            <div>
              {selectedClient?.address_city}, {selectedClient?.address_state}{' '}
              {selectedClient?.address_postal_code}
            </div>
          </InfoBlock>
          <Label>Contact</Label>
          <InfoBlock>
            <div>{selectedClient?.phone}</div>
            <div>{selectedClient?.email}</div>
          </InfoBlock>
        </StyledAccordion>
        <div>
          <Label>Summary</Label>
          <Input
            name="summary"
            placeholder="What is this appointment for?"
            ref={register()}
          />
        </div>
        <FlexColumns>
          <div>
            <Label>Time</Label>
            <StyledPicker
              InputProps={{
                disableUnderline: true,
              }}
              disablePast={true}
              value={selectedDate}
              onChange={(datetime) => handleDateChange(datetime as Date)}
            />
          </div>
          <div>
            <Label>Duration (hours)</Label>
            <Input
              name="duration_hours"
              ref={register}
              type="number"
              step=".5"
              max="12"
              min="0"
            />
          </div>
        </FlexColumns>{' '}
        <Label>Priority</Label>
        <Select
          options={priorityOptions}
          styles={selectStyles}
          onChange={(selection) => setValue('priority', selection?.value)}
        />
        <Button disabled={isRequestPending} onClick={handleSubmit(onSubmit)}>
          Add Appointment
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </form>
    </div>
  );
};
