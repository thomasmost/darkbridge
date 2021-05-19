import React, { useEffect, useMemo } from 'react';
import { Styles } from 'react-select';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { theme } from '../theme';
import { useForm } from 'react-hook-form';
import { Select, IGenericOption } from '../components/Select';
import { Label } from '../elements/Label';
import { H3, Instruction, OnboardingNav } from '../elements/OnboardingElements';
import { Input } from '../elements/Input';
import { useAuth } from '../AuthProvider';
import { IsoState, isoStates } from '../../data/iso_states';

const workOptions = [
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'other', label: 'Other' },
];

const selectStyles: Styles<IGenericOption | IsoState, false> = {
  container: (provided) => ({
    ...provided,
    cursor: 'pointer',
  }),
  control: (provided, props) => ({
    ...provided,
    backgroundColor: theme.dropdownContainerColor,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '5px 10px',
    boxShadow: props.isFocused ? '4px 4px #23C38A' : 'none',
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
  const states = useMemo(
    () => isoStates().filter((state) => state.subdivision_category === 'state'),
    [],
  );
  const { user } = useAuth();
  const { register, handleSubmit, setValue } = useForm<WorkFormFields>();
  const navigate = useNavigate();
  useEffect(() => {
    register('licensing_state');
    register('primary_work'); // custom register Antd input
  }, [register]);
  // Finally done with hooks
  if (!user) {
    return null;
  }

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

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <H3>Work and experience</H3>
        <Label>What kind of work do you do?</Label>
        <Select<IGenericOption>
          onChange={(selection) => setValue('primary_work', selection?.value)}
          defaultValue={workOptions.find(
            (item) => item.value === user?.contractor_profile?.primary_work,
          )}
          styles={selectStyles as Styles<IGenericOption, false>}
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
        <div style={{ marginBottom: '30px' }}>
          <Label>State</Label>
          <Select<IsoState>
            defaultValue={states.find(
              (item) => item.name === user?.contractor_profile?.licensing_state,
            )}
            getOptionLabel={(item) => item.name}
            getOptionValue={(item) => item.name}
            options={states}
            styles={selectStyles as Styles<IsoState, false>}
            onChange={(selection) =>
              setValue('licensing_state', selection?.name)
            }
          />
        </div>
        <OnboardingNav slideNumber={2} />
      </form>
    </div>
  );
};
