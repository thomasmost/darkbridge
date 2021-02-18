import styled from '@emotion/styled';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ClientProfileCreationAttributes } from '../../models/client_profile.model';
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

type ClientProfileFormValues = Pick<
  ClientProfileCreationAttributes,
  'created_by_user_id'
>;

export const AddClientProfile: React.FC<RouteComponentProps> = () => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const {
    register,
    handleSubmit,
    setValue,
  } = useForm<ClientProfileFormValues>();

  const onSubmit = async (data: ClientProfileFormValues) => {
    console.log(data);
    await fetch('/api/appointment', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    });
    toast.success('ClientProfile Created');
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Label>Full name</Label>
        <Input
          name="full_name"
          // defaultValue={}
          ref={register({ required: true })}
        />
        <div>
          <Label>Street Address</Label>
          <Input
            name="address_street"
            // defaultValue={profile.email}
            ref={register()}
          />
        </div>
        <FlexColumns>
          <div>
            <Label>City</Label>
            <Input
              name="address_city"
              // defaultValue={profile.email}
              ref={register()}
            />
          </div>
          <div>
            <Label>State</Label>
            <Input
              name="address_state"
              // defaultValue={profile.email}
              ref={register()}
            />
          </div>
          <div>
            <Label>Postal Code</Label>
            <Input
              name="address_postal_code"
              // defaultValue={profile.email}
              ref={register()}
            />
          </div>
        </FlexColumns>
        <Button>Add Client</Button>
        <Button>Cancel</Button>
      </form>
    </div>
  );
};
