import * as React from 'react';

import ReactSelect from 'react-select';
import { Props as SelectProps } from 'react-select';
import { Styles } from 'react-select';

export interface IGenericOption<T = string> {
  label: string;
  value: T;
}

export function Select<T>(props: SelectProps<T>) {
  const defaultStyles: Styles<T, false> = {
    indicatorSeparator: (provided) => ({
      ...provided,
      display: 'none',
    }),
  };
  const styles = {
    ...defaultStyles,
    ...props.styles,
  };
  return <ReactSelect {...props} openOnFocus={true} styles={styles} />;
}
