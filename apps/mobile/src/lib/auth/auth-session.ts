import { getSupabaseClient } from '@/lib/supabase';

export const AUTH_REQUIRED_MESSAGE = 'You must be signed in to continue.';

export function isAuthRequiredError(error: unknown): boolean {
  return error instanceof Error && error.message === AUTH_REQUIRED_MESSAGE;
}

function signOutStaleSession(): void {
  const supabase = getSupabaseClient();
  void supabase.auth.signOut();
}

export function throwUnauthorized(): never {
  throw new Error(AUTH_REQUIRED_MESSAGE);
}

/**
 * Returns a valid access token, attempting one refresh when the cached session is empty.
 * Signs out only when both getSession and refreshSession fail to produce a token.
 */
export async function resolveAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return session.access_token;
  }

  const {
    data: { session: refreshed },
  } = await supabase.auth.refreshSession();

  if (refreshed?.access_token) {
    return refreshed.access_token;
  }

  signOutStaleSession();
  return null;
}

export async function getApiAuthHeaders(includeJson = false): Promise<Record<string, string>> {
  const accessToken = await resolveAccessToken();

  if (!accessToken) {
    throw new Error(AUTH_REQUIRED_MESSAGE);
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
  };
}

export async function assertApiAuthenticated(response: Response): Promise<void> {
  if (response.status !== 401) {
    return;
  }

  const supabase = getSupabaseClient();
  const {
    data: { session: refreshed },
  } = await supabase.auth.refreshSession();

  if (refreshed?.access_token) {
    throw new Error(AUTH_REQUIRED_MESSAGE);
  }

  signOutStaleSession();
  throw new Error(AUTH_REQUIRED_MESSAGE);
}
