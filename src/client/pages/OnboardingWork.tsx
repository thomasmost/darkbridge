import React, { useEffect } from 'react';
import { Styles } from 'react-select';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { theme } from '../theme';
import { useForm } from 'react-hook-form';
import { Select, IGenericOption } from '../components/Select';
import {
  H3,
  Label,
  Instruction,
  OnboardingNav,
} from '../elements/OnboardingElements';
import { Input } from '../elements/Input';
import { useAuth } from '../AuthProvider';

const workOptions = [
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
];

const selectStyles: Styles<IGenericOption, false> = {
  container: (provided) => ({
    ...provided,
    cursor: 'pointer',
  }),
  control: (provided) => ({
    ...provided,
    backgroundColor: theme.dropdownContainerColor,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '5px 10px',
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: 'white',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#BBD',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),
};

type WorkFormFields = {
  primary_work: string;
  license_number: string;
  licensing_state: string;
};

export const OnboardingWork: React.FC<RouteComponentProps> = () => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const { register, handleSubmit, setValue } = useForm<WorkFormFields>();
  const navigate = useNavigate();

  useEffect(() => {
    register('primary_work'); // custom register Antd input
  }, [register]);

  const onSubmit = async (data: WorkFormFields) => {
    console.log(data);
    await fetch('/api/contractor_profile', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify(data),
    });
    navigate('finances');
  };

  const handleChange = (selection: IGenericOption | null) => {
    setValue('primary_work', selection?.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <H3>Work and experience</H3>
        <Label>What kind of work do you do?</Label>
        <Select
          onChange={handleChange}
          defaultValue={workOptions.find(
            (item) => item.value === user?.contractor_profile?.primary_work,
          )}
          styles={selectStyles}
          options={workOptions}
        />
        <H3>Your license</H3>
        <Instruction>Leave blank any that don&apos;t apply.</Instruction>
        <Label>License number</Label>
        <Input
          name="license_number"
          placeholder="123-456789"
          defaultValue={user?.contractor_profile?.license_number}
          ref={register({ required: false })}
        />

        <Label>State</Label>
        <Input
          name="licensing_state"
          placeholder="Delaware"
          defaultValue={user?.contractor_profile?.licensing_state}
          ref={register({ required: false })}
        />
        <OnboardingNav slideNumber={2} />
      </form>
    </div>
  );
};
