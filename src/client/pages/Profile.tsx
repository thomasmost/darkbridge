import styled from '@emotion/styled';
import { Link, RouteComponentProps } from '@reach/router';
import React from 'react';
import { ContractorProfileAttributes } from '../../models/contractor_profile.model';
import { useAuth } from '../AuthProvider';
import { Card } from '../elements/Card';
import { Label } from '../elements/Label';
import { Spacer } from '../elements/Spacer';
import { theme } from '../theme';

const HeadingText = styled.h1`
  padding-bottom: ${theme.pad(10)};
  font-size: 1.6em;
  color: ${theme.pageHeaderColor};
`;

const Item = styled.div`
  font-weight: 600;
  display: inline-block;
  margin-bottom: ${theme.pad(8)};
`;

const ProfileColumn = styled.div`
  min-width: 100px;
`;

const renderContractorProfile = (
  contractorProfile: ContractorProfileAttributes | undefined,
) => {
  if (!contractorProfile) {
    return null;
  }
  return (
    <>
      <Label>Your business</Label>
      <Card>
        <div>
          <Item>{contractorProfile.company_name}</Item>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ProfileColumn>
            <Label>Your business</Label>
            <Item>{contractorProfile.primary_work}</Item>
          </ProfileColumn>
          <ProfileColumn>
            <Label>License No.</Label>
            <Item>{contractorProfile.license_number}</Item>
          </ProfileColumn>
          <ProfileColumn>
            <Label>State of Licensing</Label>
            <Item>{contractorProfile.licensing_state}</Item>
          </ProfileColumn>
        </div>
      </Card>
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
      <Label>Your contact information</Label>
      <Card style={{ marginBottom: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <ProfileColumn>
            <Label>Full name</Label>
            <Item>
              {given_name} {family_name}
            </Item>
          </ProfileColumn>
          <ProfileColumn>
            <Label>Primary Email</Label>
            <Item>{email}</Item>
          </ProfileColumn>
          <ProfileColumn>
            <Label>Phone</Label>
            <Item>{phone}</Item>
          </ProfileColumn>
        </div>
      </Card>
      {renderContractorProfile(contractor_profile)}
      <Spacer y={4} />
      <Link to="/clients">View your clients</Link>
    </div>
  );
};
