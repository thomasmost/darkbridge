import { stateTaxes, StateTaxInfo } from './taxes';
import { isoStates } from './iso_states';

// eslint-disable-next-line max-lines-per-function
describe('Taxes', () => {
  test('There should be tax rates for every iso state', () => {
    expect.assertions(50);
    const states = isoStates();
    const taxes = stateTaxes();
    const taxesByStateName: Record<string, StateTaxInfo> = {};
    for (const record of taxes) {
      taxesByStateName[record.state] = record;
    }

    for (const state of states) {
      if (state.subdivision_category === 'state') {
        try {
          expect(taxesByStateName[state.name]).toBeDefined();
        } catch (err) {
          throw Error(`Missing tax info for ${state.name}`);
        }
      }
    }
  });
});
