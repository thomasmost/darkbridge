import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useRef, useState } from 'react';
import { theme } from '../theme';

const Input = styled.input`
  margin: 20px 0 0;
  margin-right: 20px;
`;

const TimesSign = styled.span`
  margin-right: 20px;
`;

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

export const Dashboard: React.FC<RouteComponentProps> = () => {
  const xRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<string>('');
  const [sampleVariable, setSampleVariable] = useState<string>('');
  const [icon, setIcon] = useState<string>('\\e000');

  const doMath = async () => {
    if (!xRef.current || !yRef.current) {
      return;
    }
    const x = xRef.current.value;
    const y = yRef.current.value;
    const response = await fetch(`/api/do_math?x=${x}&y=${y}`, {
      headers: standardRequestHeaders,
    });
    const result = await response.json();
    setResult(result);
  };

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

  const onChange = (x: string) => {
    while (x.length < 3) {
      x = '0' + x;
    }
    console.log(x);
    setIcon(`\\e${x}`);
  };

  const StyledIcon = styled.span`
    &:before {
      font-family: 'Teddy Icons';
      content: '${icon}';
      color: black;
      font-size: 2em;
      display: block;
      padding: 20px;
    }
  `;

  return (
    <>
      <div>
        <Input
          style={{ padding: '20px', fontSize: '2em' }}
          onChange={(e) => onChange(e.target.value)}
          type="number"
        />

        <StyledIcon aria-hidden="true" data-icon={icon} />
        <Input ref={xRef} type="number" />
        <TimesSign>X</TimesSign>
        <Input ref={yRef} type="number" />
        <Button onClick={doMath}>Do Math</Button>
        <Section>
          Product: <span>{result}</span>
        </Section>
        <Section>
          <Button onClick={getSecretVar}>Get Secret Variable</Button>
          <Button onClick={getPublicVar}>Get Public Variable</Button>
        </Section>
      </div>
      <Section>
        Example Environment Variable: <span>{sampleVariable}</span>
      </Section>
    </>
  );
};
