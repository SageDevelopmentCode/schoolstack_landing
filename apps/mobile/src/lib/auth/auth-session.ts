import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { agentLog } from '@/lib/debug-agent-log';
import { markExplicitMobileSignOut } from '@/lib/auth/mobile-explicit-sign-out';
import { getSupabaseClient } from '@/lib/supabase';

export const AUTH_REQUIRED_MESSAGE = 'You must be signed in to continue.';

export const MOBILE_CLIENT_HEADER = 'X-Schoolstack-Client';
export const MOBILE_PLATFORM_HEADER = 'X-Schoolstack-Platform';

const TOKEN_RESOLVE_MAX_ATTEMPTS = 5;
const TOKEN_RESOLVE_RETRY_MS = 50;

type ResolveAccessTokenOptions = {
  signOutOnFailure?: boolean;
};

export type FetchWithAuthOptions = {
  method?: string;
  body?: string;
  includeJson?: boolean;
  signOutOnFailure?: boolean;
};

let cachedAccessToken: string | null = null;

/** Sync in-memory token from AuthContext so API calls don't race storage reads. */
export function setCachedAccessToken(accessToken: string | null): void {
  cachedAccessToken = accessToken?.trim() ? accessToken : null;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function clearCachedAccessToken(): void {
  cachedAccessToken = null;
}

export function isAuthRequiredError(error: unknown): boolean {
  return error instanceof Error && error.message === AUTH_REQUIRED_MESSAGE;
}

function signOutStaleSession(): void {
  markExplicitMobileSignOut();
  clearCachedAccessToken();
  const supabase = getSupabaseClient();
  void supabase.auth.signOut();
}

/** Explicitly end a confirmed-stale session. Prefer over auto sign-out in API helpers. */
export function invalidateStaleSession(): void {
  signOutStaleSession();
}

export function throwUnauthorized(): never {
  throw new Error(AUTH_REQUIRED_MESSAGE);
}

async function readSessionAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? null;
  if (token) {
    setCachedAccessToken(token);
  }
  return token;
}

async function refreshAccessToken(): Promise<string | null> {
  const supabase = getSupabaseClient();
  const {
    data: { session: refreshed },
  } = await supabase.auth.refreshSession();
  const token = refreshed?.access_token ?? null;
  if (token) {
    setCachedAccessToken(token);
  }
  return token;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function parseUnauthorizedMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.clone().json()) as { error?: unknown };
    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error.trim();
    }
  } catch {
    // Fall back to the shared client auth message.
  }
  return AUTH_REQUIRED_MESSAGE;
}

async function throwUnauthorizedResponse(
  response: Response,
  signOutOnFailure: boolean,
): Promise<never> {
  if (signOutOnFailure) {
    signOutStaleSession();
  }
  throw new Error(await parseUnauthorizedMessage(response));
}

/**
 * Returns a valid access token, attempting one refresh when the cached session is empty.
 * Does not sign out by default — callers must opt in via signOutOnFailure.
 */
export async function resolveAccessToken(
  options: ResolveAccessTokenOptions = {},
): Promise<string | null> {
  const { signOutOnFailure = false } = options;

  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  for (let attempt = 0; attempt < TOKEN_RESOLVE_MAX_ATTEMPTS; attempt += 1) {
    const sessionToken = await readSessionAccessToken();
    if (sessionToken) {
      return sessionToken;
    }

    if (attempt < TOKEN_RESOLVE_MAX_ATTEMPTS - 1) {
      await delay(TOKEN_RESOLVE_RETRY_MS * (attempt + 1));
    }
  }

  const refreshedToken = await refreshAccessToken();
  if (refreshedToken) {
    return refreshedToken;
  }

  if (signOutOnFailure) {
    signOutStaleSession();
  }
  return null;
}

function mobileClientHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    [MOBILE_CLIENT_HEADER]: 'mobile',
  };

  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    headers[MOBILE_PLATFORM_HEADER] = Platform.OS;
  }

  const appVersion = Constants.expoConfig?.version?.trim();
  if (appVersion) {
    headers['X-Schoolstack-App-Version'] = appVersion;
  }

  return headers;
}

function buildAuthHeaders(
  accessToken: string,
  includeJson = false,
): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-Schoolstack-Access-Token': accessToken,
    ...mobileClientHeaders(),
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
  };
}

export async function postJsonWithAccessToken(
  url: string,
  accessToken: string,
  body: string,
): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: buildAuthHeaders(accessToken, true),
    body,
  });
}

export async function getApiAuthHeaders(includeJson = false): Promise<Record<string, string>> {
  const accessToken = await resolveAccessToken({ signOutOnFailure: false });

  if (!accessToken) {
    throw new Error(AUTH_REQUIRED_MESSAGE);
  }

  return buildAuthHeaders(accessToken, includeJson);
}

export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {},
): Promise<Response> {
  const {
    method = 'GET',
    body,
    includeJson = false,
    signOutOnFailure = false,
  } = options;

  const accessToken = await resolveAccessToken({ signOutOnFailure: false });
  if (!accessToken) {
    // #region agent log
    agentLog({
      location: 'auth-session.ts:fetchWithAuth',
      message: 'no access token before API request',
      hypothesisId: 'H1',
      data: {
        urlHost: (() => {
          try {
            return new URL(url).host;
          } catch {
            return 'invalid-url';
          }
        })(),
        cachedToken: Boolean(cachedAccessToken),
      },
    });
    // #endregion
    if (signOutOnFailure) {
      signOutStaleSession();
    }
    throw new Error(AUTH_REQUIRED_MESSAGE);
  }

  const request = (token: string) =>
    fetch(url, {
      method,
      headers: buildAuthHeaders(token, includeJson || body !== undefined),
      body,
    });

  let response = await request(accessToken);
  // #region agent log
  agentLog({
    location: 'auth-session.ts:fetchWithAuth',
    message: 'parent API response',
    hypothesisId: response.status === 401 ? 'H2' : 'H5',
    data: {
      status: response.status,
      urlHost: (() => {
        try {
          return new URL(url).host;
        } catch {
          return 'invalid-url';
        }
      })(),
      hasToken: Boolean(accessToken),
      tokenLength: accessToken.length,
    },
  });
  // #endregion
  if (response.status !== 401) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return throwUnauthorizedResponse(response, signOutOnFailure);
  }

  response = await request(refreshedToken);
  if (response.status === 401) {
    return throwUnauthorizedResponse(response, signOutOnFailure);
  }

  return response;
}

/** @deprecated Prefer fetchWithAuth, which retries once after refresh on 401. */
export async function assertApiAuthenticated(response: Response): Promise<void> {
  if (response.status !== 401) {
    return;
  }

  const refreshedToken = await refreshAccessToken();
  if (refreshedToken) {
    throw new Error(await parseUnauthorizedMessage(response));
  }

  throw new Error(AUTH_REQUIRED_MESSAGE);
}
