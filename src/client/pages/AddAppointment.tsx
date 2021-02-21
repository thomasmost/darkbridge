import styled from '@emotion/styled';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  AppointmentAttributes,
  AppointmentCreationAttributes,
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
import { apiRequest } from '../services/api.svc';
import { Select } from '../components/Select';

const Label = styled.label`
  color: ${theme.subheaderTextColor};
  display: block;
  margin-bottom: 10px;
`;

const Button = styled.button`
  width: 100%;
  display: block;
  padding: 10px;
  margin-top: 10px;
`;

type AppointmentFormValues = Pick<
  AppointmentCreationAttributes,
  | 'client_profile_id'
  | 'datetime_local'
  | 'duration_minutes'
  | 'summary'
  | 'priority'
>;

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

const StyledPicker = styled(DateTimePicker)`
  div {
    input {
      border-radius: 10px;
      box-sizing: border-box;
      display: block;
      padding: 22px 20px 23px;
      width: 100%;
      background-color: ${theme.inputBackgroundColor};
      font-family: 'Poppins', Helvetica, sans-serif;
    }
    min-width: 240px;
  }
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
  const response = await apiRequest<ClientProfileAttributes[]>(
    `client_profile?name=${name}`,
    'json',
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
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

export const AddAppointment: React.FC<RouteComponentProps> = () => {
  const [selectedDate, setDate] = useState(new Date());
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<AppointmentFormValues>();
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
    setValue('datetime_local', date.toString());
    setDate(date);
  };

  const onSubmit = async (data: AppointmentFormValues) => {
    console.log(data);
    const result = await apiRequest<AppointmentAttributes>(
      'appointment',
      'json',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    if (!result.error) {
      toast.success('Appointment Created');
      navigate('/');
    }
  };
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
          }}
        />
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
            <Label>Duration</Label>
            <Input
              name="duration_minutes"
              ref={register}
              type="number"
              step="30"
              max="600"
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
        <Button>Add Appointment</Button>
        <Button>Cancel</Button>
      </form>
    </div>
  );
};
