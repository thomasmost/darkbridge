import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FlexColumns } from '../elements/FlexColumns';
import { theme } from '../theme';

const Section = styled.div`
  margin-top: 20px;
  span {
    font-weight: 600;
    color: ${theme.headerTextColor};
  }
`;

const Button = styled.button`
  cursor: pointer;
  margin-right: 10px;
`;

const standardRequestHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const Label = styled.label`
  margin-top: 20px;
  display: block;
`;

type CityStateFormValues = {
  city: string;
  state: string;
};

export const ApiSandbox: React.FC<RouteComponentProps> = () => {
  const [sampleVariable, setSampleVariable] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const { handleSubmit, register } = useForm<CityStateFormValues>();

  async function getTimezone(values: CityStateFormValues) {
    const response = await fetch(
      `/api/timezone?city=${values.city}&state=${values.state}`,
      {
        headers: {
          Accept: 'application/text',
          'Content-Type': 'application/text',
        },
      },
    );

    const result = await response.text();
    setTimezone(result);
  }

  const getSecretVar = async () => {
    const response = await fetch(`/api/get_secret_var`, {
      headers: standardRequestHeaders,
    });

    const result = await response.json();
    setSampleVariable(result.var);
  };

  const getPublicVar = async () => {
    const response = await fetch(`/api/get_public_var`, {
      headers: standardRequestHeaders,
    });

    const result = await response.json();
    setSampleVariable(result.var);
  };

  return (
    <>
      <div>
        <Section>
          <Button onClick={getSecretVar}>Get Secret Variable</Button>
          <Button onClick={getPublicVar}>Get Node Env</Button>
        </Section>
      </div>
      <Section>
        Example Environment Variable: <span>{sampleVariable}</span>
      </Section>
      <Section>
        <h2>Test the Timezone API</h2>
        <form onSubmit={handleSubmit(getTimezone)}>
          <FlexColumns>
            <div>
              <Label>City</Label>
              <input name="city" ref={register()} />
            </div>
            <div>
              <Label>State</Label>
              <input name="state" ref={register()} />
            </div>
          </FlexColumns>
          <button type="submit">Submit</button>
          <Section>
            <span>{timezone}</span>
          </Section>
        </form>
      </Section>
    </>
  );
};
