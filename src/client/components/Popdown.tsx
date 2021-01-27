import styled from '@emotion/styled';
import React, { useRef, useState } from 'react';
import { theme } from '../theme';
import { useClickAway } from '../useClickAway';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const ClickTarget = styled.div`
  cursor: pointer;
`;

interface IPopdownProps {
  targetContent: string | JSX.Element;
}

export const Popdown: React.FC<IPopdownProps> = ({
  targetContent,
  children,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const popdownRef = useRef<HTMLDivElement>(null);
  useClickAway(popdownRef, () => setOpen(false));

  const PopdownBody = styled.div`
    display: ${open ? 'block' : 'none'};
    position: absolute;
    top: 40px;
    width: 100%;
    background-color: ${theme.applicationBackgroundColor};
  `;

  return (
    <Container ref={popdownRef}>
      <ClickTarget onClick={() => setOpen(!open)}>{targetContent}</ClickTarget>
      <PopdownBody>{children}</PopdownBody>
    </Container>
  );
};
