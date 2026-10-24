export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;

export type PasswordCheck = {
  minLength: boolean;
  upper: boolean;
  lower: boolean;
  number: boolean;
  special: boolean;
  isStrong: boolean;
  score: number;
};

export function checkPassword(value: string): PasswordCheck {
  const minLength = value.length >= 8;
  const upper = /[A-Z]/.test(value);
  const lower = /[a-z]/.test(value);
  const number = /\d/.test(value);
  const special = /[^A-Za-z0-9]/.test(value);
  const flags = [minLength, upper, lower, number, special];
  const score = flags.filter(Boolean).length;

  return {
    minLength,
    upper,
    lower,
    number,
    special,
    isStrong: STRONG_PASSWORD_REGEX.test(value),
    score,
  };
}

// Math.random is not good enough for passwords, use the crypto generator
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

function pick(chars: string): string {
  return chars[randomInt(chars.length)];
}

// strong temporary password: upper, lower, digit and special character
export function generateStrongPassword(length = 12): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*?';
  const all = upper + lower + digits + special;

  const required = [pick(upper), pick(lower), pick(digits), pick(special)];
  const rest = Array.from({ length: Math.max(length - required.length, 0) }, () =>
    pick(all),
  );
  const chars = [...required, ...rest];

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
