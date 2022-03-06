import React from 'react';
import { UseFormMethods } from 'react-hook-form';
import { Input } from '../elements/Input';
import { Label } from '../elements/Label';
import { PrefixedInputContainer } from '../elements/PrefixedInputContainer';

type Register = UseFormMethods['register'];
type FormSectionProps = {
  register: Register;
  error_message?: string;
};

export const InvoiceHourlyFormSection: React.FC<FormSectionProps> = ({
  register,
}) => {
  return (
    <>
      <Label style={{ margin: '0', width: '15%' }}>Hourly Rate</Label>
      <PrefixedInputContainer>
        $
        <Input
          style={{ margin: '0' }}
          name="hourly_rate_in_major_units"
          ref={register}
          min="0"
          type="number"
        />
      </PrefixedInputContainer>
      <Label style={{ margin: '0', paddingLeft: '20px', width: '15%' }}>
        Minutes Billed
      </Label>
      <Input
        style={{ margin: '0', width: '25%' }}
        name="minutes_billed"
        ref={register}
        min="0"
        type="number"
      />
    </>
  );
};