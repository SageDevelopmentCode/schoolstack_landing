import { getSupabaseClient } from '@/lib/supabase';

export type AuthRecoveryRoute = '/portal' | '/';

/** Prefer /portal when a session exists; otherwise send to intro. Does not sign out. */
export async function resolveAuthRecoveryRoute(): Promise<AuthRecoveryRoute> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ? '/portal' : '/';
}
