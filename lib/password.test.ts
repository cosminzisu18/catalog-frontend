import {
  checkPassword,
  generateStrongPassword,
  STRONG_PASSWORD_REGEX,
} from './password';

describe('checkPassword', () => {
  it('accepts a strong password', () => {
    const check = checkPassword('Parola1!Strong');
    expect(check.isStrong).toBe(true);
    expect(check.score).toBe(5);
  });

  it('lists what is missing', () => {
    const check = checkPassword('parola');
    expect(check).toMatchObject({
      isStrong: false,
      minLength: false,
      upper: false,
      lower: true,
      number: false,
      special: false,
    });
  });

  it('refuses passwords longer than 72 characters (bcrypt limit)', () => {
    expect(checkPassword('Aa1!' + 'x'.repeat(69)).isStrong).toBe(false);
  });
});

describe('generateStrongPassword', () => {
  it('always generates a strong password', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(generateStrongPassword()).toMatch(STRONG_PASSWORD_REGEX);
    }
  });

  it('respects the requested length', () => {
    expect(generateStrongPassword(20)).toHaveLength(20);
  });

  it('does not repeat itself', () => {
    expect(generateStrongPassword()).not.toBe(generateStrongPassword());
  });
});
