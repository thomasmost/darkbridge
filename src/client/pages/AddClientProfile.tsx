import { RouteComponentProps, useNavigate } from '@reach/router';
import React from 'react';
import { toast } from 'react-toastify';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { postRequest } from '../services/api.svc';
import {
  ClientProfileForm,
  ClientProfileFormValues,
} from '../components/ClientProfileForm';
import { useBlockingRequest } from '../useBlockingRequest';

export const AddClientProfile: React.FC<RouteComponentProps> = () => {
  const navigate = useNavigate();
  const { blockFor, isRequestPending } = useBlockingRequest();
  const onSubmit = blockFor(async (data: ClientProfileFormValues) => {
    const result = await postRequest<
      ClientProfileFormValues,
      ClientProfileAttributes
    >('client_profile', 'json', data);
    if (!result.error) {
      toast.success('Client Created');
      navigate('/calendar/add-appointment');
    }
    return result;
  });
  return (
    <ClientProfileForm
      onSubmit={onSubmit}
      isRequestPending={isRequestPending}
      submitText="Add Client"
    />
  );
};
