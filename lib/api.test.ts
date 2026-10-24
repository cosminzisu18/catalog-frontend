import { api, ApiError } from './api';
import { SESSION_EXPIRED_EVENT } from './auth';

// small helper for fake fetch answers
function reply(status: number, body?: unknown) {
  return Promise.resolve(
    new Response(body === undefined ? null : JSON.stringify(body), { status }),
  );
}

describe('api', () => {
  const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();
  const sessionExpired = jest.fn();

  beforeAll(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
    // api() fires an event on window when the session is gone
    const fakeWindow = new EventTarget();
    fakeWindow.addEventListener(SESSION_EXPIRED_EVENT, sessionExpired);
    (globalThis as { window?: EventTarget }).window = fakeWindow;
  });

  beforeEach(() => {
    fetchMock.mockReset();
    sessionExpired.mockReset();
  });

  const calledPaths = () => fetchMock.mock.calls.map(([url]) => new URL(url).pathname);

  it('sends JSON with the session cookies and returns the data', async () => {
    fetchMock.mockReturnValueOnce(reply(200, { id: 1 }));

    const data = await api<{ id: number }>('/grades', {
      method: 'POST',
      body: JSON.stringify({ value: 9 }),
    });

    expect(data).toEqual({ id: 1 });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe('include');
    expect(new Headers(init.headers).get('Content-Type')).toBe(
      'application/json',
    );
  });

  it('returns nothing for 204 No Content', async () => {
    fetchMock.mockReturnValueOnce(reply(204));
    await expect(api('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('throws an ApiError with the server message', async () => {
    fetchMock.mockReturnValueOnce(
      reply(400, { message: ['Nota maxima este 10', 'Data invalida'] }),
    );

    const error = await api('/grades').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(400);
    expect((error as ApiError).message).toBe(
      'Nota maxima este 10, Data invalida',
    );
  });

  it('refreshes the session once on 401 and retries the request', async () => {
    fetchMock
      .mockReturnValueOnce(reply(401))
      .mockReturnValueOnce(reply(200, {}))
      .mockReturnValueOnce(reply(200, { ok: true }));

    await expect(api('/grades/mine')).resolves.toEqual({ ok: true });
    expect(calledPaths()).toEqual([
      expect.stringMatching(/\/grades\/mine$/),
      expect.stringMatching(/\/auth\/refresh$/),
      expect.stringMatching(/\/grades\/mine$/),
    ]);
    expect(sessionExpired).not.toHaveBeenCalled();
  });

  it('uses a single refresh for requests that fail at the same time', async () => {
    fetchMock.mockImplementation((url) => {
      if (url.endsWith('/auth/refresh')) return reply(200, {});
      const retried = fetchMock.mock.calls.filter(([u]) => u === url).length > 1;
      return retried ? reply(200, { url }) : reply(401);
    });

    await Promise.all([api('/a'), api('/b'), api('/c')]);

    const refreshes = calledPaths().filter((p) => p.endsWith('/auth/refresh'));
    expect(refreshes).toHaveLength(1);
  });

  it('reports an expired session when the refresh fails', async () => {
    fetchMock
      .mockReturnValueOnce(reply(401))
      .mockReturnValueOnce(reply(401));

    await expect(api('/grades/mine')).rejects.toBeInstanceOf(ApiError);
    expect(sessionExpired).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when the refresh is rate limited', async () => {
    fetchMock
      .mockReturnValueOnce(reply(401))
      .mockReturnValueOnce(reply(429));

    const error = await api('/grades/mine').catch((e: unknown) => e);

    expect((error as ApiError).status).toBe(503);
    expect(sessionExpired).not.toHaveBeenCalled();
  });

  it('does not refresh on public routes', async () => {
    fetchMock.mockReturnValueOnce(
      reply(401, { message: 'Email sau parola incorecta' }),
    );

    await expect(
      api('/auth/login', { method: 'POST', auth: false }),
    ).rejects.toThrow('Email sau parola incorecta');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(sessionExpired).not.toHaveBeenCalled();
  });
});
