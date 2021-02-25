import styled from '@emotion/styled';
import { RouteComponentProps, useNavigate } from '@reach/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  ClientProfileAttributes,
  ClientProfileCreationAttributes,
} from '../../models/client_profile.model';
import { useAuth } from '../AuthProvider';
import { Button } from '../elements/Button';
import { FlexColumns } from '../elements/FlexColumns';
import { Input } from '../elements/Input';
import { apiRequest } from '../services/api.svc';
import { theme } from '../theme';

const Label = styled.label`
  color: ${theme.subheaderTextColor};
  display: block;
  margin-bottom: 10px;
`;

type ClientProfileFormValues = Pick<
  ClientProfileCreationAttributes,
  'created_by_user_id'
>;

export const AddClientProfile: React.FC<RouteComponentProps> = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<ClientProfileFormValues>();
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  const onSubmit = async (data: ClientProfileFormValues) => {
    console.log(data);
    const result = await apiRequest<ClientProfileAttributes>(
      'client_profile',
      'json',
      {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(data),
      },
    );
    if (!result.error) {
      toast.success('Client Created');
      navigate('/calendar/add-appointment');
    }
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Label>Name</Label>
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
        <FlexColumns>
          <div>
            <Label>Email</Label>
            <Input
              name="email"
              // defaultValue={profile.email}
              ref={register()}
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              name="phone"
              // defaultValue={profile.email}
              ref={register()}
            />
          </div>
        </FlexColumns>
        <Button>Add Client</Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/calendar/add-appointment')}
        >
          Cancel
        </Button>
      </form>
    </div>
  );
};
