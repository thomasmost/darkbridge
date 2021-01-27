import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useRef, useState } from 'react';

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
    color: white;
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

  return (
    <>
      <div>
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
