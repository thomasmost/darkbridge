import React from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { FlexColumns } from '../elements/FlexColumns';
import { useForm } from 'react-hook-form';
import { OnboardingNav } from '../elements/OnboardingElements';

const H3 = styled.h3`
  color: ${theme.darkModeTextColor};
  display: block;
  font-size: 1.4em;
  margin: 50px 0 10px;
`;

const Label = styled.label`
  color: ${theme.subheaderTextColor};
  display: block;
  margin-bottom: 10px;
  margin-top: 20px;
`;

const Instruction = styled(Label)`
  font-style: italic;
`;

const Input = styled.input`
  border-radius: 10px;
  box-sizing: border-box;
  display: block;
  margin-bottom: 30px;
  padding: 10px 20px;
  width: 100%;
`;

type FinancesFormFields = {
  appointment_fee: number;
  hourly_rate: number;
  daily_rate: number;
  estimated_yearly_income: number;
  estimated_yearly_expenses: number;
};

export const OnboardingFinances: React.FC<RouteComponentProps> = () => {
  const { register, handleSubmit } = useForm<FinancesFormFields>();
  const navigate = useNavigate();

  const onSubmit = async (data: FinancesFormFields) => {
    console.log(data);
    await fetch('/api/contractor_profile', {
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
          type="number"
          ref={register({ required: false })}
        />
        <FlexColumns>
          <div>
            <Label>$ / hour</Label>
            <Input
              name="hourly_rate"
              placeholder="$"
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
