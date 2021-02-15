import styled from '@emotion/styled';
import React from 'react';
import { theme } from '../theme';

const Container = styled.div`
  display: block;
`;

interface IDotsProps {
  count: number;
  checked: number;
  diameter?: number;
  navigations?: (() => void)[];
}

export const Dots: React.FC<IDotsProps> = ({
  navigations,
  count,
  checked,
  diameter,
}) => {
  const dotDiameter = diameter || 10;
  const dots = [];

  for (let i = 0; i < count; i++) {
    const Dot = styled.div`
      height: ${dotDiameter}px;
      width: ${dotDiameter}px;
      background-color: ${i < checked
        ? theme.dotColorActive
        : theme.dotColorPassive};
      display: inline-block;
      margin-right: ${dotDiameter}px;
      border-radius: 5px;
      cursor: pointer;
    `;
    if (navigations && navigations[i]) {
      dots.push(<Dot key={i} onClick={navigations[i]} />);
    } else {
      dots.push(<Dot key={i} />);
    }
  }

  return <Container>{dots}</Container>;
};
