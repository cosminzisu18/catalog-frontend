import {
  formatDateDdMmYyyy,
  formatGrade,
  fullName,
  gradeText,
} from './format';

describe('formatGrade', () => {
  it('shows whole grades without decimals', () => {
    expect(formatGrade(9)).toBe('9');
    expect(formatGrade('10.00')).toBe('10');
  });

  it('keeps useful decimals only', () => {
    expect(formatGrade(9.5)).toBe('9.5');
    expect(formatGrade('9.25')).toBe('9.25');
    expect(formatGrade(8.1)).toBe('8.1');
  });
});

describe('gradeText', () => {
  it('marks the thesis', () => {
    expect(gradeText(7, 'THESIS')).toBe('7 (teza)');
    expect(gradeText(7, 'NORMAL')).toBe('7');
    expect(gradeText(7)).toBe('7');
  });
});

describe('fullName', () => {
  it('joins first and last name, or shows a dash', () => {
    expect(fullName({ firstName: 'Ana', lastName: 'Pop' })).toBe('Ana Pop');
    expect(fullName(null)).toBe('—');
  });
});

describe('formatDateDdMmYyyy', () => {
  it('formats a date as dd-mm-yyyy', () => {
    expect(formatDateDdMmYyyy(new Date(2026, 9, 5))).toBe('05-10-2026');
  });

  it('shows a dash for an invalid date', () => {
    expect(formatDateDdMmYyyy('nu e o data')).toBe('—');
  });
});
