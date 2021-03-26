export function toMajorUnits(amount_in_minor_units: number) {
  return (amount_in_minor_units / 100).toFixed(2);
}

export function coalesceToMinorUnits(amount_in_major_units: number) {
  return (amount_in_major_units || 0) * 100;
}
