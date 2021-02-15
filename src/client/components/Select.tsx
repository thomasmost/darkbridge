import * as React from 'react';

import ReactSelect from 'react-select';
import { Props as SelectProps } from 'react-select';
import { Styles } from 'react-select';

export interface IGenericOption<T = string> {
  label: string;
  value: T;
}

const defaultStyles: Styles<IGenericOption, false> = {
  indicatorSeparator: (provided) => ({
    ...provided,
    display: 'none',
  }),
};

export function Select(props: SelectProps<IGenericOption>) {
  const styles = {
    ...defaultStyles,
    ...props.styles,
  };
  return <ReactSelect {...props} openOnFocus={true} styles={styles} />;
}
