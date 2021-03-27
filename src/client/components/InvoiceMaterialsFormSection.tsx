import styled from '@emotion/styled';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { coalesceToMinorUnits } from '../../helpers/currency.helper';
import { FlexColumns } from '../elements/FlexColumns';
import { Input } from '../elements/Input';
import { Label } from '../elements/Label';
import { theme } from '../theme';

interface IFormValues {
  description: string;
  quantity: number;
  amount_in_major_units: number;
}

interface ILineItem extends IFormValues {
  amount_in_minor_units: number;
}

interface IInvoiceLineItemFormProps {
  onChange: (formValue: IFormValues) => void;
}

export const InvoiceLineItemForm: React.FC<IInvoiceLineItemFormProps> = ({
  onChange,
}) => {
  const { register, watch } = useForm<IFormValues>();
  const { amount_in_major_units, description, quantity } = watch();

  const lineItem = {
    amount_in_major_units,
    description,
    quantity,
  };
  const handleChange = () => {
    onChange(lineItem);
  };

  const { subtotal, complete } = evaluateLineItem(lineItem);
  const warn = subtotal && !complete;

  const TotalContainer = styled.div`
    color: ${warn ? theme.warningColor : theme.textColor};
    padding: 13px 0 12px;
  `;

  return (
    <FlexColumns>
      <div>
        <Label>Description</Label>
        <Input name="description" ref={register} onChange={handleChange} />
      </div>
      <div>
        <Label>Price per Unit</Label>
        <Input
          name="amount_in_major_units"
          ref={register}
          onChange={handleChange}
          min="0"
          type="number"
        />
      </div>
      <div>
        <Label>Quantity</Label>
        <Input
          name="quantity"
          ref={register}
          onChange={handleChange}
          min="0"
          type="number"
        />
      </div>
      <div>
        <Label>Total</Label>
        <TotalContainer>${subtotal}</TotalContainer>
      </div>
    </FlexColumns>
  );
};

function evaluateLineItem(lineItem: IFormValues) {
  if (
    !lineItem.description &&
    !lineItem.amount_in_major_units &&
    !lineItem.quantity
  ) {
    return {
      empty: true,
      complete: false,
      subtotal: 0,
    };
  }
  if (
    !lineItem.description ||
    !lineItem.amount_in_major_units ||
    !lineItem.quantity
  ) {
    return {
      complete: false,
      subtotal:
        (lineItem.amount_in_major_units || 0) * (lineItem.quantity || 0),
    };
  }
  return {
    complete: true,
    subtotal: lineItem.amount_in_major_units * lineItem.quantity,
  };
}

const renderLineItems = (
  lineItems: ILineItem[],
  onChange: (index: number, formValue: IFormValues) => void,
) =>
  lineItems.map((lineItem, i) => (
    <InvoiceLineItemForm key={i} onChange={(values) => onChange(i, values)} />
  ));

interface IInvoiceMaterialsFormSectionProps {
  setTotalFromMaterials: React.Dispatch<React.SetStateAction<number>>;
}

const changeHandler = (
  index: number,
  lineItemValues: IFormValues,
  lineItems: ILineItem[],
  setLineItems: (lineItems: ILineItem[]) => void,
  setTotalFromMaterials: (total: number) => void,
) => {
  const amount_in_minor_units = coalesceToMinorUnits(
    lineItemValues.amount_in_major_units,
  );
  lineItems[index] = { ...lineItemValues, amount_in_minor_units };
  let anyIncomplete = false;
  let shouldPopLast = false;
  let total = 0;
  for (let i = 0; i < lineItems.length; i++) {
    const lineItem = lineItems[i];
    const { complete, empty, subtotal } = evaluateLineItem(lineItem);
    if (i === lineItems.length - 1 && empty && anyIncomplete) {
      shouldPopLast = true;
    }
    if (complete) {
      total += subtotal;
    } else {
      anyIncomplete = true;
    }
  }
  if (!anyIncomplete) {
    lineItems.push({
      description: '',
      quantity: 0,
      amount_in_major_units: 0,
      amount_in_minor_units: 0,
    });
  }
  if (shouldPopLast) {
    lineItems.pop();
  }
  setTotalFromMaterials(total * 100);
  setLineItems([...lineItems]);
};

export const InvoiceMaterialsFormSection: React.FC<IInvoiceMaterialsFormSectionProps> = ({
  setTotalFromMaterials,
}) => {
  const [lineItems, setLineItems] = useState<ILineItem[]>([
    {
      description: '',
      quantity: 0,
      amount_in_major_units: 0,
      amount_in_minor_units: 0,
    },
  ]);

  const onChange = (index: number, lineItemValues: IFormValues) =>
    changeHandler(
      index,
      lineItemValues,
      lineItems,
      setLineItems,
      setTotalFromMaterials,
    );
  return <div>{renderLineItems(lineItems, onChange)}</div>;
};
