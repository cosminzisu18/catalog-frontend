import { subjectColor } from './subject-colors';

describe('subjectColor', () => {
  it('gives the same subject the same color', () => {
    expect(subjectColor(3)).toBe(subjectColor(3));
  });

  it('gives neighbouring subjects different colors', () => {
    expect(subjectColor(1)).not.toBe(subjectColor(2));
  });

  it('works for any id', () => {
    expect(subjectColor(-4)).toBeDefined();
    expect(subjectColor(Number.NaN)).toBe(subjectColor(0));
  });
});
