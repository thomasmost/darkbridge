import { RouteComponentProps, useNavigate } from '@reach/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { getRequest, putRequest } from '../services/api.svc';
import {
  ClientProfileForm,
  ClientProfileFormValues,
} from '../components/ClientProfileForm';

export const EditClientProfile: React.FC<
  RouteComponentProps<{ client_profile_id: string }>
> = ({ client_profile_id }) => {
  const navigate = useNavigate();
  const [
    clientProfile,
    setClientProfile,
  ] = useState<ClientProfileAttributes | null>(null);

  useEffect(() => {
    if (!client_profile_id) {
      return;
    }
    getRequest(`client_profile/${client_profile_id}`).then((result) => {
      if (result.error) {
        return;
      }
      setClientProfile(result.data);
    });
  }, []);

  if (!clientProfile) {
    return null;
  }

  const onSubmit = async (data: ClientProfileFormValues) => {
    const result = await putRequest<ClientProfileFormValues>(
      `client_profile/${client_profile_id}`,
      'json',
      data,
    );
    if (!result.error) {
      toast.success('Client Updated');
      navigate('/clients');
    }
  };
  return (
    <ClientProfileForm
      client_profile={clientProfile}
      onSubmit={onSubmit}
      submitText="Update Client"
    />
  );
};
