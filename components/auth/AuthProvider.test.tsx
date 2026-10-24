/** @jest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import { api, ApiError } from '@/lib/api';
import { AuthProvider, useAuth } from './AuthProvider';

jest.mock('@/lib/api', () => {
  const actual = jest.requireActual('@/lib/api');
  return { ...actual, api: jest.fn() };
});
const apiMock = api as jest.Mock;

function Who() {
  const { user, ready } = useAuth();
  if (!ready) return <p>loading</p>;
  return <p>{user ? user.email : 'logged out'}</p>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    apiMock.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('logs out only when the server says there is no session', async () => {
    apiMock.mockRejectedValueOnce(new ApiError('Neautorizat', 401));

    render(
      <AuthProvider>
        <Who />
      </AuthProvider>,
    );

    expect(await screen.findByText('logged out')).toBeTruthy();
  });

  it('retries after a rate limit instead of logging the user out', async () => {
    apiMock
      .mockRejectedValueOnce(new ApiError('Too Many Requests', 429))
      .mockResolvedValueOnce({ email: 'elev@scoala.ro' });

    render(
      <AuthProvider>
        <Who />
      </AuthProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText('loading')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(await screen.findByText('elev@scoala.ro')).toBeTruthy();
    expect(apiMock).toHaveBeenCalledTimes(2);
  });
});
