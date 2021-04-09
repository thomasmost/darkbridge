import styled from '@emotion/styled';
import React from 'react';
import { Button as ReakitButton, ButtonProps } from 'reakit';
import { theme } from '../theme';

type ButtonType = 'primary' | 'warning' | 'secondary';

type IButtonProps = ButtonProps & {
  variant?: ButtonType;
};

type ButtonTheme = {
  activeColor: string;
  disabledColor: string;
};

const buttonTheme: Record<ButtonType, ButtonTheme> = {
  primary: {
    activeColor: theme.buttonColorActive,
    disabledColor: theme.buttonColorDisabledPrimary,
  },
  warning: {
    activeColor: theme.warningColor,
    disabledColor: theme.buttonColorDisabledWarning,
  },
  secondary: {
    activeColor: theme.buttonColorActiveSecondary,
    disabledColor: theme.buttonColorDisabledDefault,
  },
};

export const Button: React.FC<IButtonProps> = ({
  children,
  variant,
  onClick,
  onSubmit,
  ...args
}) => {
  if (!variant) {
    variant = 'primary';
  }
  const StyledButton = styled(ReakitButton)`
    width: 100%;
    display: block;
    padding: 10px;
    margin-top: 10px;
    background-color: ${buttonTheme[variant].activeColor};
    &:disabled {
      background-color: ${buttonTheme[variant].disabledColor};
    }
  `;

  return (
    <StyledButton onClick={onClick} onSubmit={onSubmit} {...args}>
      {children}
    </StyledButton>
  );
};
