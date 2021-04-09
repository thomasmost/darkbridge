import styled from '@emotion/styled';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useContext, useEffect, useState } from 'react';
import Radio, { RadioProps } from '@material-ui/core/Radio';

import { useForm } from 'react-hook-form';
import { theme } from '../theme';

import { AppointmentAttributes } from '../../models/appointment.model';
import { AppointmentCard } from '../components/AppointmentCard';
import { ClientCard } from '../components/ClientCard';
import { DispatchContext, StateContext } from '../reducers';
import { queryAppointments } from '../services/appointment.svc';
import { Card } from '../elements/Card';
import { Button } from '../elements/Button';
import { Input } from '../elements/Input';

import { withStyles } from '@material-ui/core/styles';
import { putRequest } from '../services/api.svc';

const StyledRadio = withStyles({
  root: {
    '&$checked': {
      color: theme.dotColorActive,
    },
  },
  checked: {},
})((props: RadioProps) => <Radio color="default" {...props} />);

const WarningHeader = styled.h3`
  font-size: 1.6em;
  font-weight: 600;
  color: ${theme.pageHeaderColor};
  margin: 40px 0 20px;
`;
// const WarningText = styled.p``;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RUNNING_LATE = 'running late';
const EMERGENCY = 'emergency';

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
  cancelation_reason: string;
};

const StyledCard = styled(Card)`
  margin-top: 30px;
  line-height: 40px;
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
`;

const CancelationReasonForm: React.FC<{ appointment_id: string }> = ({
  appointment_id,
}) => {
  const [cancelationReason, setCancelationReason] = useState<string>();
  const { register, setValue, handleSubmit } = useForm<FormValues>({
    defaultValues: { cancelation_reason: 'emergency' },
  });
  const navigate = useNavigate();

  useEffect(() => {
    register('cancelation_reason');
  }, [register]);

  const handleChange = (value: string) => {
    setValue('cancelation_reason', value);
    setCancelationReason(value);
  };

  const onSubmit = async (values: FormValues) => {
    const body = {
      ...values,
      appointment_id,
    };
    const { error } = await putRequest(
      `appointment/${appointment_id}/cancel`,
      'text',
      body,
    );
    if (!error) {
      navigate(-1);
    }
  };

  const hasOtherValue =
    cancelationReason !== undefined &&
    cancelationReason !== EMERGENCY &&
    cancelationReason !== RUNNING_LATE;

  return (
    <>
      <StyledCard onClick={() => handleChange(EMERGENCY)}>
        <FlexRow>
          <div>Emergency</div>
          <StyledRadio checked={cancelationReason === EMERGENCY} />
        </FlexRow>
      </StyledCard>
      <StyledCard onClick={() => handleChange(RUNNING_LATE)}>
        <FlexRow>
          <div>Running late</div>
          <StyledRadio checked={cancelationReason === RUNNING_LATE} />
        </FlexRow>
      </StyledCard>
      <StyledCard onClick={() => handleChange('')}>
        <FlexRow>
          <div>Other</div>
          <StyledRadio checked={hasOtherValue} />
        </FlexRow>
        <StyledInput
          onClick={(e) => e.stopPropagation()}
          placeholder="Reason for cancelation..."
          onChange={(e) => handleChange(e.currentTarget.value)}
          value={hasOtherValue ? cancelationReason : ''}
        />
      </StyledCard>
      <ButtonContainer>
        <Button onClick={handleSubmit(onSubmit)}>Submit Cancelation</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </ButtonContainer>
    </>
  );
};

const StyledInput = styled(Input)`
  margin-bottom: 0;
`;

export const CancelAppointment: React.FC<
  RouteComponentProps<{ appointment_id: string }>
> = (props) => {
  const { appointments } = useContext(StateContext);
  const dispatch = useContext(DispatchContext);

  const { appointment_id } = props;

  const currentAppointment = appointments?.find(
    (appointment) => appointment.id === appointment_id,
  );

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
      dispatch({ type: 'SET_APPOINTMENTS', data: result.data });
    });
  }, []);

  if (!currentAppointment) {
    return null;
  }
  return (
    <div>
      <AppointmentCard appointment={currentAppointment} warning />
      <WarningHeader>Are you sure?</WarningHeader>
      <p>
        In general, you shouldn&apos;t cancel an appointment day-of unless
        you&apos;re running more than an hour behind.
      </p>
      <CancelationReasonForm appointment_id={currentAppointment.id} />
    </div>
  );
};
