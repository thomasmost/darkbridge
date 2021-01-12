import styled from '@emotion/styled';
import React from 'react';

type IconName = 'darkbridge';

interface IIconProps {
  name: IconName;
  color?: string;
  onClick?: () => void;
}

const iconUnicode: Record<IconName, string> = {
  darkbridge: '\\e900',
};

export const Icon: React.FC<IIconProps> = ({ name, color, onClick }) => {
  const StyledIcon = styled.span`
    &:before {
      font-family: 'Darkbridge Icons';
      content: '${iconUnicode[name]}';
      ${color ? `color: ${color};` : ''}
      ${onClick ? `cursor: pointer;` : ''}
    }
  `;

  return (
    <StyledIcon
      onClick={onClick}
      aria-hidden="true"
      data-icon={iconUnicode[name]}
    />
  );
};
