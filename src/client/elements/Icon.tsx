import styled from '@emotion/styled';
import React from 'react';

type IconName = 'pencil' | 'home' | 'profile';

interface IIconProps {
  name: IconName;
  color?: string;
  onClick?: () => void;
}

const iconUnicode: Record<IconName, string> = {
  home: '\\e903',
  pencil: '\\e905',
  profile: '\\e971',
};

export const Icon: React.FC<IIconProps> = ({ name, color, onClick }) => {
  const StyledIcon = styled.span`
    &:before {
      font-family: 'Teddy Icons';
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
