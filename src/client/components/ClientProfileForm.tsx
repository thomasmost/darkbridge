import { useNavigate } from '@reach/router';
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Styles } from 'react-select';
import Select from 'react-select';

import { isoStates } from '../../data/iso_states';
import {
  ClientProfileAttributes,
  ClientProfileCreationAttributes,
} from '../../models/client_profile.model';
import { useAuth } from '../AuthProvider';
import { Button } from '../elements/Button';
import { FlexColumns } from '../elements/FlexColumns';
import { Input } from '../elements/Input';
import { Label } from '../elements/Label';
import { theme } from '../theme';

export type ClientProfileFormValues = Omit<
  ClientProfileCreationAttributes,
  'created_by_user_id'
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectStyles: Styles<any, false> = {
  container: (provided) => ({
    ...provided,
    cursor: 'pointer',
    width: '100%',
  }),
  control: (provided, props) => ({
    ...provided,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    padding: '5px 10px',
    marginBottom: '20px',
    backgroundColor: theme.inputBackgroundColor,
    boxShadow: props.isFocused ? '4px 4px #23C38A' : 'none',
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    display: 'none',
  }),
  option: (provided, option) => ({
    ...provided,
    cursor: 'pointer',
    fontStyle: option.label === 'Add a New Client' ? 'italic' : 'normal',
  }),
};

type ClientProfileFormProps = {
  onSubmit: (values: ClientProfileFormValues) => void;
  client_profile?: ClientProfileAttributes;
  submitText: string;
};

export const ClientProfileForm: React.FC<ClientProfileFormProps> = ({
  onSubmit,
  client_profile,
  submitText,
}) => {
  const states = useMemo(
    () => isoStates().filter((state) => state.subdivision_category === 'state'),
    [],
  );
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<ClientProfileFormValues>(
    {
      defaultValues: client_profile,
    },
  );
  const { user } = useAuth();
  useEffect(() => {
    register('address_state');
  }, [register]);
  if (!user) {
    return null;
  }
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FlexColumns>
          <div className="expand">
            <Label>First Name</Label>
            <Input name="given_name" ref={register({ required: true })} />
          </div>
          <div className="expand">
            <Label>Last Name</Label>
            <Input name="family_name" ref={register({ required: true })} />
          </div>
        </FlexColumns>
        <div className="expand">
          <Label>Street Address</Label>
          <Input name="address_street" ref={register()} />
        </div>
        <FlexColumns>
          <div className="expand">
            <Label>City</Label>
            <Input name="address_city" ref={register()} />
          </div>
          <div className="expand">
            <Label>State</Label>
            <Select
              getOptionLabel={(item) => item.name}
              getOptionValue={(item) => item.name}
              options={states}
              styles={selectStyles}
              onChange={(selection) =>
                setValue('address_state', selection.name)
              }
            />
          </div>
          <div className="expand">
            <Label>Postal Code</Label>
            <Input
              name="address_postal_code"
              // defaultValue={profile.email}
              ref={register()}
            />
          </div>
        </FlexColumns>
        <FlexColumns>
          <div className="expand">
            <Label>Email</Label>
            <Input name="email" ref={register()} />
          </div>
          <div className="expand">
            <Label>Phone</Label>
            <Input name="phone" ref={register()} />
          </div>
        </FlexColumns>
        <Button onClick={handleSubmit(onSubmit)}>{submitText}</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </form>
    </div>
  );
};