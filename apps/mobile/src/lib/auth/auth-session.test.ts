import {
  AUTH_REQUIRED_MESSAGE,
  assertApiAuthenticated,
  getApiAuthHeaders,
  isAuthRequiredError,
} from '@/lib/auth/auth-session';
import { getSupabaseClient } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
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

describe('getApiAuthHeaders', () => {
  const signOut = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSupabaseClient.mockReturnValue({
      auth: {
        getSession: jest.fn(),
        signOut,
      },
    } as never);
  });

  it('returns auth headers when a session token exists', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: { access_token: 'token-123' } },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, signOut },
    } as never);

    await expect(getApiAuthHeaders(true)).resolves.toEqual({
      Authorization: 'Bearer token-123',
      'Content-Type': 'application/json',
    });
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out and throws when the session token is missing', async () => {
    const getSession = jest.fn().mockResolvedValue({
      data: { session: null },
    });
    mockGetSupabaseClient.mockReturnValue({
      auth: { getSession, signOut },
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
      auth: { signOut },
    } as never);
  });

  it('signs out and throws on 401 responses', () => {
    expect(() => assertApiAuthenticated({ status: 401 } as Response)).toThrow(
      AUTH_REQUIRED_MESSAGE,
    );
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('does nothing for non-401 responses', () => {
    expect(() => assertApiAuthenticated({ status: 403 } as Response)).not.toThrow();
    expect(signOut).not.toHaveBeenCalled();
  });
});
