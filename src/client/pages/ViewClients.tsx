import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useEffect, useState } from 'react';
import { Input } from '../elements/Input';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { getRequest } from '../services/api.svc';
import { Label } from '../elements/Label';
import { theme } from '../theme';
import { ClientDetailsCard } from '../components/ClientDetailsCard';

const H2 = styled.h2`
  font-size: 1.5em;
  margin-bottom: ${theme.pad(2)};
`;

const renderClients = (clients: ClientProfileAttributes[]) => {
  const clientCards = [];
  for (const client of clients) {
    clientCards.push(<ClientDetailsCard client={client} />);
  }
  return clientCards;
};

export const ViewClients: React.FC<RouteComponentProps> = () => {
  const [clients, setClients] = useState<ClientProfileAttributes[]>([]);

  const loadClients = async (name: string) => {
    const response = await getRequest<ClientProfileAttributes[]>(
      `client_profile?name=${name}`,
    );
    if (response.error) {
      return [];
    }
    const results = response.data;
    setClients(results);
  };

  useEffect(() => {
    loadClients('');
  }, []);

  return (
    <div>
      <H2>Client List</H2>
      <form>
        <Label>Search</Label>
        <Input onChange={(event) => loadClients(event.currentTarget.value)} />
      </form>
      <div>{renderClients(clients)}</div>
    </div>
  );
};
