import { getSupabaseClient } from '@/lib/supabase';

export const AUTH_REQUIRED_MESSAGE = 'You must be signed in to continue.';

export function isAuthRequiredError(error: unknown): boolean {
  return error instanceof Error && error.message === AUTH_REQUIRED_MESSAGE;
}

function signOutStaleSession(): void {
  const supabase = getSupabaseClient();
  void supabase.auth.signOut();
}

export async function getApiAuthHeaders(includeJson = false): Promise<Record<string, string>> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    signOutStaleSession();
    throw new Error(AUTH_REQUIRED_MESSAGE);
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
  };
}

export function assertApiAuthenticated(response: Response): void {
  if (response.status === 401) {
    signOutStaleSession();
    throw new Error(AUTH_REQUIRED_MESSAGE);
  }
}
