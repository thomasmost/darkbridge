import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { FlexColumns } from '../elements/FlexColumns';
import { useForm } from 'react-hook-form';
import { Label } from '../elements/Label';
import { H3, Instruction, OnboardingNav } from '../elements/OnboardingElements';
import { Input } from '../elements/Input';
import { useAuth } from '../AuthProvider';
import { apiRequest } from '../services/api.svc';

type FinancesFormFields = {
  appointment_fee: number;
  hourly_rate: number;
  daily_rate: number;
  estimated_yearly_income: number;
  estimated_yearly_expenses: number;
};

export const OnboardingFinances: React.FC<RouteComponentProps> = () => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const { register, handleSubmit } = useForm<FinancesFormFields>();
  const navigate = useNavigate();

  const onSubmit = async (data: FinancesFormFields) => {
    console.log(data);
    await apiRequest('contractor_profile', 'text', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(data),
    });
    navigate('bank');
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <H3>What have you charged in the past?</H3>
        <Instruction>Leave blank any that don&apos;t apply.</Instruction>
        <Label>Appointment Fee ($)</Label>
        <Input
          name="appointment_fee"
          placeholder="$"
          defaultValue={user?.contractor_profile?.appointment_fee}
          type="number"
          ref={register({ required: false })}
        />
        <FlexColumns>
          <div>
            <Label>$ / hour</Label>
            <Input
              name="hourly_rate"
              placeholder="$"
              defaultValue={user?.contractor_profile?.hourly_rate}
              step="5"
              type="number"
              ref={register({ required: false })}
            />
          </div>
          <div>
            <Label>$ / day</Label>
            <Input
              name="daily_rate"
              placeholder="$"
              defaultValue={user?.contractor_profile?.daily_rate}
              step="5"
              type="number"
              ref={register({ required: false })}
            />
          </div>
        </FlexColumns>
        <H3>What are your estimated yearly income and expenses?</H3>
        <Instruction>Just ballpark it.</Instruction>
        <FlexColumns>
          <div>
            <Label>Yearly income</Label>
            <Input
              name="estimated_yearly_income"
              step="5000"
              max="2000000"
              placeholder="$"
              defaultValue={user?.contractor_profile?.estimated_yearly_income}
              type="number"
              ref={register({ required: false })}
            />
          </div>
          <div>
            <Label>Yearly expenses</Label>
            <Input
              name="estimated_yearly_expenses"
              step="5000"
              max="1000000"
              placeholder="$"
              defaultValue={user?.contractor_profile?.estimated_yearly_expenses}
              type="number"
              ref={register({ required: false })}
            />
          </div>
        </FlexColumns>
        <OnboardingNav slideNumber={3} />
      </form>
    </div>
  );
};
