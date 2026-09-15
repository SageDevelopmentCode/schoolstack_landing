import {
  AUTH_REQUIRED_MESSAGE,
  assertApiAuthenticated,
  getApiAuthHeaders,
  isAuthRequiredError,
  MOBILE_CLIENT_HEADER,
  MOBILE_PLATFORM_HEADER,
  resolveAccessToken,
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

  it('signs out when refresh does not produce a token', async () => {
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
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe('getApiAuthHeaders', () => {
  const signOut = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
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
      [MOBILE_CLIENT_HEADER]: 'mobile',
      [MOBILE_PLATFORM_HEADER]: 'ios',
      'X-Schoolstack-App-Version': '1.2.3',
      'Content-Type': 'application/json',
    });
    expect(signOut).not.toHaveBeenCalled();
  });

  it('refreshes before returning headers when the cached session is empty', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'refreshed-token' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, refreshSession, signOut },
    } as never);

    await expect(getApiAuthHeaders()).resolves.toEqual({
      Authorization: 'Bearer refreshed-token',
      [MOBILE_CLIENT_HEADER]: 'mobile',
      [MOBILE_PLATFORM_HEADER]: 'ios',
      'X-Schoolstack-App-Version': '1.2.3',
    });
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('throws when refresh does not produce a token', async () => {
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
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe('assertApiAuthenticated', () => {
  const signOut = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabaseClient.mockReturnValue({
      auth: { refreshSession: jest.fn(), signOut },
    } as never);
  });

  it('does nothing for non-401 responses', async () => {
    await expect(assertApiAuthenticated({ status: 403 } as Response)).resolves.toBeUndefined();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('does not sign out when refresh recovers a session after 401', async () => {
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'refreshed-token' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { refreshSession, signOut },
    } as never);

    await expect(assertApiAuthenticated({ status: 401 } as Response)).rejects.toThrow(
      AUTH_REQUIRED_MESSAGE,
    );
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out when refresh fails after 401', async () => {
    const refreshSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { refreshSession, signOut },
    } as never);

    await expect(assertApiAuthenticated({ status: 401 } as Response)).rejects.toThrow(
      AUTH_REQUIRED_MESSAGE,
    );
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
