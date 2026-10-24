import { formatAverage } from './stats';

describe('formatAverage', () => {
  it('always shows two decimals', () => {
    expect(formatAverage(9.5)).toBe('9.50');
    expect(formatAverage(10)).toBe('10.00');
    expect(formatAverage(8.67)).toBe('8.67');
  });

  it('shows a dash when there is no average', () => {
    expect(formatAverage(null)).toBe('—');
    expect(formatAverage(undefined)).toBe('—');
  });
});
