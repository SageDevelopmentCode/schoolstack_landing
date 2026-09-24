import { resolveAuthRecoveryRoute } from '@/lib/auth/auth-recovery';
import { getSupabaseClient } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  getSupabaseClient: jest.fn(),
}));

const mockGetSupabaseClient = getSupabaseClient as jest.MockedFunction<typeof getSupabaseClient>;

describe('resolveAuthRecoveryRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns /portal when a session token exists', async () => {
    mockGetSupabaseClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: { access_token: 'token-123' } },
        }),
        signOut: jest.fn(),
      },
    } as never);

    await expect(resolveAuthRecoveryRoute()).resolves.toBe('/portal');
  });

  it('returns / when no session exists without signing out', async () => {
    const signOut = jest.fn();
    mockGetSupabaseClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
        }),
        signOut,
      },
    } as never);

    await expect(resolveAuthRecoveryRoute()).resolves.toBe('/');
    expect(signOut).not.toHaveBeenCalled();
  });
});
