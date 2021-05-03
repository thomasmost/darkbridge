import styled from '@emotion/styled';
import { Link } from '@reach/router';
import React from 'react';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';
import { Card } from '../elements/Card';

type ClientProfileCardProps = {
  client: ClientProfileAttributes;
};

const CardHeading = styled.div`
  display: flex;
  align-items: center;
  color: ${theme.cardHeaderColor};
  margin-bottom: 5px;
`;

const ClientTitleRow = styled.div`
  display: flex;
  margin-bottom: 40px;
  align-items: center;
`;

const Avatar = styled.div`
  height: 60px;
  width: 60px;
  border-radius: 30px;
  background-color: ${theme.boxShadowColor};
  margin-right: 20px;
`;

const ClientName = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2em;
`;

const ActionRow = styled.div`
  margin-top: ${theme.pad(4)};
  display: flex;
`;
const ActionButton = styled(Link)`
  align-items: center;
  display: flex;
  justify-content: space-around;
  background-color: ${theme.blockColorDefault};
  color: ${theme.buttonColorActive};
  border-radius: 40px;
  width: 100%;
  line-height: 30px;
  padding: 10px 0;
  font-size: 2em;
  margin-right: 10px;
  &:last-child {
    margin-right: 0;
  }
  &:active,
  &:focus {
    color: white;
  }
`;
const ActionBadge = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-around;
  background-color: ${theme.blockColorDefault};
  color: ${theme.activeLinkColor};
  border-radius: 40px;
  width: 100%;
  line-height: 30px;
  padding: 10px 0;
  font-size: 2em;
  margin-right: 10px;
  &:last-child {
    margin-right: 0;
  }
  cursor: default;
`;
const ActionBadgeActive = styled(ActionBadge)`
  background-color: ${theme.blockColorActive};
`;

const IconTextPair = styled.div`
  display: flex;
  justify-content: space-around;
`;

const CardInfo = styled.div`
  margin-left: 40px;
  font-weight: 500;
  line-height: 1.5em;
  color: ${theme.textColor};
`;

export const ClientDetailsCard: React.FC<ClientProfileCardProps> = ({
  client,
}) => {
  return (
    <Card style={{ marginBottom: theme.pad(6) }}>
      <ClientTitleRow>
        <Avatar />
        <ClientName>{client.full_name}</ClientName>
      </ClientTitleRow>
      <div>
        <CardHeading>
          <span
            style={{
              fontSize: '1.5em',
              display: 'inline-block',
              width: '40px',
            }}
          >
            <Icon name="Location" />
          </span>
          Address
        </CardHeading>
        <CardInfo>{client.address_street}</CardInfo>
        <CardInfo>
          {client.address_city}, {client.address_state}{' '}
          {client.address_postal_code}
        </CardInfo>
      </div>
      <ActionRow>
        <ActionButton to={`/edit-client/${client.id}`}>
          <IconTextPair>
            <Icon name="Edit-Square" />
            <span
              style={{
                display: 'block',
                fontSize: '.6em',
                marginLeft: theme.pad(2),
              }}
            >
              Edit
            </span>
          </IconTextPair>
        </ActionButton>
        {!client.has_primary_payment_method && (
          <ActionBadge>
            <IconTextPair>
              <Icon name="Wallet" />
              <span
                style={{
                  display: 'block',
                  fontSize: '.6em',
                  marginLeft: theme.pad(2),
                }}
              >
                No Payment Method
              </span>
            </IconTextPair>
          </ActionBadge>
        )}
        {client.has_primary_payment_method && (
          <ActionBadgeActive>
            <IconTextPair>
              <Icon name="Wallet" />
              <span
                style={{
                  display: 'block',
                  fontSize: '.6em',
                  marginLeft: theme.pad(2),
                }}
              >
                Has Payment Method
              </span>
            </IconTextPair>
          </ActionBadgeActive>
        )}
      </ActionRow>
    </Card>
  );
};
