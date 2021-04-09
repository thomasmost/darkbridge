import styled from '@emotion/styled';
import { DateTimePicker } from '@material-ui/pickers';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import React, { useContext, useEffect, useState } from 'react';

import { theme } from '../theme';

import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentCard } from '../components/AppointmentCard';
import { ClientCard } from '../components/ClientCard';
import { DispatchContext, StateContext } from '../reducers';
import { queryAppointments } from '../services/appointment.svc';
import { Button } from '../elements/Button';
import { Input } from '../elements/Input';

import { putRequest } from '../services/api.svc';
import { FlexColumns } from '../elements/FlexColumns';
import { DateTimeHelper } from '../../helpers/datetime.helper';

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

export const renderCustomerInfo = (
  appointment: AppointmentAttributes | null,
) => {
  if (!appointment) {
    return null;
  }
  if (!appointment.client_profile) {
    return <div>No associated client</div>;
  }
  return <ClientCard client={appointment.client_profile} />;
};

type FormValues = {
  datetime_local: string;
  duration_hours: number;
  reason_for_reschedule: string;
};

const Label = styled.label`
  color: ${theme.subheaderTextColor};
  display: block;
  margin-bottom: 10px;
`;

const Spacer = styled.div`
  width: 100%;
  height: 20px;
`;

export const RescheduleAppointment: React.FC<
  RouteComponentProps<{ appointment_id: string }>
  // eslint-disable-next-line sonarjs/cognitive-complexity
> = (props) => {
  const { appointments } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);
  const [selectedDate, setDate] = useState(new Date());
  const navigate = useNavigate();
  const { appointment_id } = props;
  const currentAppointment = appointments?.find(
    (appointment) => appointment.id === appointment_id,
  );
  const { register, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      duration_hours: currentAppointment
        ? currentAppointment.duration_minutes / 60
        : 1,
    },
  });
  useEffect(() => {
    register('datetime_local');
  }, [register]);
  useEffect(() => {
    if (!appointment_id) {
      return;
    }
    if (currentAppointment) {
      return;
    }
    // the additional 'noop' id is a hack to satisfy the swagger validation
    queryAppointments({ ids: [appointment_id, 'noop'] }).then((result) => {
      if (result.error) {
        return;
      }
      dispatch({
        type: 'SET_APPOINTMENTS',
        data: result.data,
      });
    });
  }, []);
  const handleDateChange = (date: Date) => {
    setValue('datetime_local', DateTimeHelper.formatToPureDateTime(date));
    setDate(date);
  };
  const onSubmit = async (values: FormValues) => {
    const data = {
      ...values,
      duration_minutes: Math.ceil(values.duration_hours * 60),
    };
    if (!currentAppointment) {
      return;
    }
    const result = await putRequest<AppointmentAttributes, typeof data>(
      `appointment/${currentAppointment.id}/reschedule`,
      'json',
      data,
    );
    if (!result.error) {
      toast.success('Appointment Rescheduled');
      dispatch({ type: 'RESCHEDULE_APPOINTMENT_SUCCESS', data: result.data });
      navigate(`/appointment/${currentAppointment.id}`);
    }
  };
  if (!currentAppointment) {
    return null;
  }
  return (
    <div>
      <AppointmentCard appointment={currentAppointment} warning />
      <Spacer />
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
      </FlexColumns>
      <Button onClick={handleSubmit(onSubmit)}>Reschedule Appointment</Button>
      <Button variant="secondary" onClick={() => navigate(-1)}>
        Cancel
      </Button>
    </div>
  );
};
