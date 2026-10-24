import { SESSION_EXPIRED_EVENT } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type ApiOptions = RequestInit & {
  // false = public route: a 401 does not trigger refresh / logout
  auth?: boolean;
};

// requests that get a 401 at the same time wait for the same
// refresh instead of each starting its own
let refreshing: Promise<RefreshResult> | null = null;

// 'unavailable' = rate limit or server down: the session may still be
// valid, so the user is not logged out for it
type RefreshResult = 'ok' | 'invalid' | 'unavailable';

function refreshSession(): Promise<RefreshResult> {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((res): RefreshResult => {
      if (res.ok) return 'ok';
      return res.status === 429 || res.status >= 500 ? 'unavailable' : 'invalid';
    })
    .catch((): RefreshResult => 'unavailable')
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

function send(path: string, init: RequestInit) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  // the httpOnly session cookies go out with every request
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
}

export async function api<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { auth = true, ...init } = options;

  let res = await send(path, init);

  // the access token (15 min) expired: refresh once and retry
  if (res.status === 401 && auth) {
    const refreshed = await refreshSession();
    if (refreshed === 'unavailable') {
      throw new ApiError('Serverul nu raspunde acum, incearca din nou', 503);
    }
    if (refreshed === 'ok') {
      res = await send(path, init);
    }
    if (res.status === 401) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = (await res.json().catch(() => ({}))) as {
    message?: string | string[];
  };

  if (!res.ok) {
    const message = data.message ?? 'Cererea a esuat';
    throw new ApiError(
      Array.isArray(message) ? message.join(', ') : message,
      res.status,
      data,
    );
  }

  return data as T;
}
