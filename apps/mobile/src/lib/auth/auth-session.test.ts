import {
  AUTH_REQUIRED_MESSAGE,
  clearCachedAccessToken,
  fetchWithAuth,
  getApiAuthHeaders,
  isAuthRequiredError,
  MOBILE_CLIENT_HEADER,
  MOBILE_PLATFORM_HEADER,
  resolveAccessToken,
  setCachedAccessToken,
} from '@/lib/auth/auth-session';
import { getSupabaseClient } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { version: '1.2.3' },
  },
}));

const mockGetSupabaseClient = getSupabaseClient as jest.MockedFunction<typeof getSupabaseClient>;

function unauthorizedResponse(error = 'You must be signed in.'): Response {
  return {
    status: 401,
    clone: () =>
      ({
        json: async () => ({ error }),
      }) as Response,
  } as Response;
}

describe('isAuthRequiredError', () => {
  it('matches the shared auth-required message', () => {
    expect(isAuthRequiredError(new Error(AUTH_REQUIRED_MESSAGE))).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(isAuthRequiredError(new Error('Request failed.'))).toBe(false);
    expect(isAuthRequiredError('You must be signed in to continue.')).toBe(false);
  });
});

describe('resolveAccessToken', () => {
  const signOut = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    clearCachedAccessToken();
  });

  it('uses the in-memory cached token before reading storage', async () => {
    setCachedAccessToken('memory-token');
    const getSession = jest.fn();
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession: jest.fn(), signOut },
    } as never);

    await expect(resolveAccessToken()).resolves.toBe('memory-token');
    expect(getSession).not.toHaveBeenCalled();
  });

  it('returns the cached session token when available', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession: jest.fn(), signOut },
    } as never);

    await expect(resolveAccessToken()).resolves.toBe('token-123');
    expect(signOut).not.toHaveBeenCalled();
  });

  it('refreshes and returns a token when the cached session is empty', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'refreshed-token' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    await expect(resolveAccessToken()).resolves.toBe('refreshed-token');
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('does not sign out by default when refresh does not produce a token', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    await expect(resolveAccessToken()).resolves.toBeNull();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out when signOutOnFailure is true', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    await expect(resolveAccessToken({ signOutOnFailure: true })).resolves.toBeNull();
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe('getApiAuthHeaders', () => {
  const signOut = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    clearCachedAccessToken();
  });

  it('returns auth headers when a session token exists', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession: jest.fn(), signOut },
    } as never);

    await expect(getApiAuthHeaders(true)).resolves.toEqual({
      Authorization: 'Bearer token-123',
      'X-Schoolstack-Access-Token': 'token-123',
      [MOBILE_CLIENT_HEADER]: 'mobile',
      [MOBILE_PLATFORM_HEADER]: 'ios',
      'X-Schoolstack-App-Version': '1.2.3',
      'Content-Type': 'application/json',
    });
    expect(signOut).not.toHaveBeenCalled();
  });

  it('throws without signing out when refresh does not produce a token', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    await expect(getApiAuthHeaders()).rejects.toThrow(AUTH_REQUIRED_MESSAGE);
    expect(signOut).not.toHaveBeenCalled();
  });
});

describe('fetchWithAuth', () => {
  const signOut = jest.fn().mockResolvedValue(undefined);
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    clearCachedAccessToken();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('retries once after refreshing on 401', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'refreshed-token' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ status: 200 });

    const response = await fetchWithAuth('https://example.com/api/parent-portal/home');
    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('throws the API unauthorized message when retry still returns 401', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'refreshed-token' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(unauthorizedResponse())
      .mockResolvedValueOnce(unauthorizedResponse());

    await expect(fetchWithAuth('https://example.com/api/parent-portal/home')).rejects.toThrow(
      'You must be signed in.',
    );
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out when signOutOnFailure is true and retry still returns 401', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'refreshed-token' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(unauthorizedResponse())
      .mockResolvedValueOnce(unauthorizedResponse());

    await expect(
      fetchWithAuth('https://example.com/api/parent-portal/home', { signOutOnFailure: true }),
    ).rejects.toThrow('You must be signed in.');
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('does not sign out on failure when signOutOnFailure is false', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    await expect(
      fetchWithAuth('https://example.com/api/parent-portal/home', { signOutOnFailure: false }),
    ).rejects.toThrow(AUTH_REQUIRED_MESSAGE);
    expect(signOut).not.toHaveBeenCalled();
  });
});
