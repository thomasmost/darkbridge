import React from 'react';
import { UseFormMethods } from 'react-hook-form';
import { Input } from '../elements/Input';
import { Label } from '../elements/Label';
import { PrefixedInputContainer } from '../elements/PrefixedInputContainer';
import { theme } from '../theme';

type Register = UseFormMethods['register'];
type FormSectionProps = {
  register: Register;
  error_message?: string;
};

export const InvoiceTaxesFormSection: React.FC<FormSectionProps> = ({
  register,
  error_message,
}) => {
  return (
    <>
      {Boolean(error_message) && (
        <div style={{ color: theme.warningColor, width: '100%' }}>
          Failed to load suggested tax rates for this appointment
        </div>
      )}
      <Label style={{ margin: '0', width: '15%' }}>State Tax</Label>
      <PrefixedInputContainer>
        %
        <Input
          style={{ margin: '0' }}
          step="0.1"
          name="state_tax_rate"
          ref={register}
          min="0"
          type="number"
        />
      </PrefixedInputContainer>
      <Label style={{ margin: '0', marginLeft: '20px', width: '15%' }}>
        Local Tax
      </Label>
      <PrefixedInputContainer>
        %
        <Input
          style={{ margin: '0' }}
          step="0.1"
          name="local_tax_rate"
          ref={register}
          min="0"
          type="number"
        />
      </PrefixedInputContainer>
    </>
  );
};
