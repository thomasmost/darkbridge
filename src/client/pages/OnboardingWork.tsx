import React, { useEffect } from 'react';
import { Styles } from 'react-select';
import { RouteComponentProps, useNavigate } from '@reach/router';
import styled from '@emotion/styled';
import { theme } from '../theme';
import { useForm } from 'react-hook-form';
import { Select, IGenericOption } from '../components/Select';
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
          styles={selectStyles}
          options={workOptions}
        />
        <H3>Your license</H3>
        <Instruction>Leave blank any that don&apos;t apply.</Instruction>
        <Label>License number</Label>
        <Input
          name="license_number"
          placeholder="123-456789"
          ref={register({ required: false })}
        />

        <Label>State</Label>
        <Input
          name="licensing_state"
          placeholder="Delaware"
          ref={register({ required: false })}
        />
        <OnboardingNav slideNumber={2} />
      </form>
    </div>
  );
};
