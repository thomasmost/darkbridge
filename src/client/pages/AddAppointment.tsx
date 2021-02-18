import styled from '@emotion/styled';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { AppointmentCreationAttributes } from '../../models/appointment.model';
import { useAuth } from '../AuthProvider';
import { FlexColumns } from '../elements/FlexColumns';
import { Input } from '../elements/Input';
import { theme } from '../theme';

const Label = styled.label`
  color: ${theme.subheaderTextColor};
  display: block;
`;

const Button = styled.button`
  width: 100%;
  display: block;
  padding: 10px;
  margin-top: 10px;
`;

type AppointmentFormValues = Pick<
  AppointmentCreationAttributes,
  'client_profile_id' | 'datetime_local' | 'duration_minutes'
>;

export const AddAppointment: React.FC<RouteComponentProps> = () => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const { register, handleSubmit, setValue } = useForm<AppointmentFormValues>();
  const navigate = useNavigate();

  useEffect(() => {
    register('client_profile_id'); // custom register Antd input
  }, [register]);

  const onSubmit = async (data: AppointmentFormValues) => {
    console.log(data);
    await fetch('/api/appointment', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    });
    toast.success('Appointment Created');
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexColumns>
          <div>
            <Label>Time</Label>
          </div>
          <div>
            <Label>Duration (hours)</Label>
            <Input type="number" step=".5" max="24" />
          </div>
        </FlexColumns>
        <Button>Add Appointment</Button>
        <Button>Cancel</Button>
      </form>
    </div>
  );
};
