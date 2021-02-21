import styled from '@emotion/styled';
import React from 'react';
import { ClientProfileAttributes } from '../../models/client_profile.model';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';

type ClientProfileCardProps = {
  client: ClientProfileAttributes;
};

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

const Card = styled.div`
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 20px 20px ${theme.boxShadowColor};
  cursor: pointer;
  padding: 20px;
`;
const ClientName = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.2em;
`;

const ContactRow = styled.div`
  display: flex;
`;
const ContactButton = styled.button`
  background-color: #daedfd;
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
`;

export const ClientCard: React.FC<ClientProfileCardProps> = ({ client }) => {
  return (
    <Card>
      <ClientTitleRow>
        <Avatar />
        <ClientName>{client.full_name}</ClientName>
      </ClientTitleRow>
      <ContactRow>
        <ContactButton>
          <Icon name="Call" />
        </ContactButton>
        <ContactButton>
          <Icon name="Message" />
        </ContactButton>
        <ContactButton>
          <Icon name="Chat" />
        </ContactButton>
      </ContactRow>
    </Card>
  );
};
