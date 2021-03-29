import { RouteComponentProps, useNavigate } from '@reach/router';
import React from 'react';
import { toast } from 'react-toastify';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { apiRequest } from '../services/api.svc';
import {
  ClientProfileForm,
  ClientProfileFormValues,
} from '../components/ClientProfileForm';

export const AddClientProfile: React.FC<RouteComponentProps> = () => {
  const navigate = useNavigate();
  const onSubmit = async (data: ClientProfileFormValues) => {
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
  return <ClientProfileForm onSubmit={onSubmit} submitText="Add Client" />;
};
