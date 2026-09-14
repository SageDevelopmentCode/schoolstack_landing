import { resolveAccessToken } from '@/lib/auth/auth-session';

export type AuthRecoveryRoute = '/portal' | '/';

/** Prefer /portal when a session can still be recovered; otherwise send to intro. */
export async function resolveAuthRecoveryRoute(): Promise<AuthRecoveryRoute> {
  const accessToken = await resolveAccessToken();
  return accessToken ? '/portal' : '/';
}
