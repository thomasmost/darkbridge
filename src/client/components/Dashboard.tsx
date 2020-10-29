import styled from '@emotion/styled';
import { RouteComponentProps } from '@reach/router';
import React, { useRef, useState } from 'react';

const Input = styled.input`
  margin: 20px 0;
  margin-right: 20px;
`;

const standardRequestHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

export const Dashboard: React.FC<RouteComponentProps> = () => {
  const xRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<string>('');

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

  const getTestVar = async () => {
    const response = await fetch(`/api/get_test_var`, {
      headers: standardRequestHeaders,
    });

    const result = await response.json();
    setResult(result.var);
  };

  return (
    <>
      <div>
        <Input ref={xRef} type="number" />
        <Input ref={yRef} type="number" />
        <button onClick={doMath}>Do math!</button>
        <button onClick={getTestVar}>Get Var</button>
      </div>
      <div>{result}</div>
    </>
  );
};
