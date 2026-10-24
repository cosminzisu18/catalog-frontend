import { dashboardPath, settingsPath } from './auth';

describe('auth paths', () => {
  it('sends every role to its own dashboard', () => {
    expect(dashboardPath('DIRECTOR')).toBe('/director');
    expect(dashboardPath('TEACHER')).toBe('/profesor');
    expect(dashboardPath('STUDENT')).toBe('/elev');
  });

  it('builds the settings path', () => {
    expect(settingsPath('TEACHER')).toBe('/profesor/setari');
  });
});
