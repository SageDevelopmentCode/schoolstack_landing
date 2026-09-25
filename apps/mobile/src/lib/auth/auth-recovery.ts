import { ensureSupabaseAuthStorageReady, getSupabaseClient } from '@/lib/supabase';

export type AuthRecoveryRoute = '/portal' | '/';

const SESSION_RECOVERY_MAX_ATTEMPTS = 5;
const SESSION_RECOVERY_RETRY_MS = 50;

/** Prefer /portal when a session exists; otherwise send to intro. Does not sign out. */
export async function resolveAuthRecoveryRoute(): Promise<AuthRecoveryRoute> {
  await ensureSupabaseAuthStorageReady();
  const supabase = getSupabaseClient();

  for (let attempt = 0; attempt < SESSION_RECOVERY_MAX_ATTEMPTS; attempt += 1) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      return '/portal';
    }

    await new Promise((resolve) => {
      setTimeout(resolve, SESSION_RECOVERY_RETRY_MS * (attempt + 1));
    });
  }

  return '/';
}
