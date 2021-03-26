import styled from '@emotion/styled';
import { Accordion } from '@material-ui/core';
import React, { useState } from 'react';
import { Icon } from '../elements/Icon';
import { theme } from '../theme';

const InvoiceSectionHeader = styled.div`
  font-weight: 600;
  font-size: 1em;
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  cursor: pointer;
  * {
    cursor: pointer;
  }
  span {
    color: ${theme.lightIconColor};
  }
`;

type InvoiceSectionProps = {
  label: string;
  total: string;
  disabled?: boolean;
  readonly?: boolean;
  zeroed?: boolean;
};

const ExpandedContentsContainer = styled.div`
  align-items: center;
  display: flex;
  padding: 10px 20px 10px;
  flex-wrap: wrap;
`;

export const InvoiceSection: React.FC<InvoiceSectionProps> = ({
  label,
  total,
  disabled,
  readonly,
  zeroed,
  children,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const Amount = styled.label`
    color: ${disabled || zeroed
      ? theme.subheaderTextColor
      : theme.passiveLinkColor};
    margin-right: 10px;
  `;
  return (
    <Accordion expanded={expanded && !disabled && !readonly}>
      <InvoiceSectionHeader onClick={() => setExpanded(!expanded)}>
        <label>{label}</label>
        <div>
          <Amount>${total}</Amount>
          {!readonly && !disabled && (
            <Icon name={expanded ? 'Arrow-Up-2' : 'Arrow-Down-2'} />
          )}
          {!readonly && disabled && <Icon name="Discount" />}
        </div>
      </InvoiceSectionHeader>
      <ExpandedContentsContainer>{children}</ExpandedContentsContainer>
    </Accordion>
  );
};
