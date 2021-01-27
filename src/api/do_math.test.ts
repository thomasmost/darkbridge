import { doMath } from './do_math';

describe('Do math', () => {
  test('adds 2 * 3 to equal 6', (done) => {
    expect(doMath(2, 3)).toBe(6);
    done();
  });
});
