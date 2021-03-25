export function toMajorUnits(amount_in_minor_units: number) {
  return (amount_in_minor_units / 100).toFixed(2);
}
