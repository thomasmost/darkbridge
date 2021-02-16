import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React from 'react';
import { ContractorProfileAttributes } from '../../models/contractor_profile.model';
import { useAuth } from '../AuthProvider';
import { theme } from '../theme';

const HeadingText = styled.h1`
  padding-bottom: 50px;
  font-size: 1.6em;
  color: ${theme.pageHeaderColor};
`;

const Label = styled.label`
  display: block;
  font-size: 1.2em;
  font-weight: 400;
  margin-bottom: 20px;
`;

const Item = styled.div`
  font-weight: 600;
  display: inline-block;
  margin-bottom: 40px;
`;
const Additional = styled(Item)`
  font-style: italic;
  margin-left: 20px;
`;

const renderContractorProfile = (
  contractorProfile: ContractorProfileAttributes | undefined,
) => {
  if (!contractorProfile) {
    return null;
  }
  return (
    <>
      <div>
        <Label>Company</Label>
        <Item>{contractorProfile.company_name}</Item>
        <Additional>{contractorProfile.primary_work}</Additional>
      </div>
      <div>
        <Label>License</Label>
        <Item>{contractorProfile.license_number}</Item>
        <Additional>{contractorProfile.licensing_state}</Additional>
      </div>
    </>
  );
};

export const Profile: React.FC<RouteComponentProps> = () => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  const { given_name, family_name, email, phone, contractor_profile } = user;
  return (
    <div>
      <HeadingText>Hi {given_name}!</HeadingText>
      <div>
        <Label>Full name</Label>
        <Item>
          {given_name} {family_name}
        </Item>
      </div>
      <div>
        <Label>Primary Email</Label>
        <Item>{email}</Item>
      </div>
      <div>
        <Label>Phone</Label>
        <Item>{phone}</Item>
      </div>
      {renderContractorProfile(contractor_profile)}
    </div>
  );
};
