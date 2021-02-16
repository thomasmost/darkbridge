import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React from 'react';
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

export const AddAppointment: React.FC<RouteComponentProps> = () => {
  return (
    <div>
      <FlexColumns>
        <div>
          <Label>Time</Label>
        </div>
        <div>
          <Label>Duration (hours)</Label>
          <Input type="number" step=".5" max="24" />
        </div>
      </FlexColumns>
      <Button>Add Appointment</Button>
      <Button>Cancel</Button>
    </div>
  );
};
