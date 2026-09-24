export const MOBILE_ACCESS_TOKEN_HEADER = "x-schoolstack-access-token";

type HeaderReader = {
  get(name: string): string | null;
};

export function readAccessTokenFromHeaders(headerStore: HeaderReader): string | null {
  const authHeader = headerStore.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    if (token) return token;
  }

  const customToken = headerStore.get(MOBILE_ACCESS_TOKEN_HEADER)?.trim();
  return customToken || null;
}

export function getBearerAccessToken(request: Request): string | null {
  return readAccessTokenFromHeaders(request.headers);
}

/**
 * Bearer JWT from the request, then from Next.js `headers()` when the
 * Authorization header is hidden from the route `Request` object.
 */
export async function resolveRequestAccessToken(request: Request): Promise<string | null> {
  const fromRequest = getBearerAccessToken(request);
  if (fromRequest) return fromRequest;

  try {
    const { headers } = await import("next/headers");
    const headerStore = await headers();
    return readAccessTokenFromHeaders(headerStore);
  } catch {
    return null;
  }
}

type AuthFailure = {
  message?: string;
  code?: string;
} | null;

export function signedInErrorMessage(
  accessToken: string | null,
  authError?: AuthFailure,
): string {
  if (!accessToken) {
    return "You must be signed in to continue. (missing_token)";
  }

  const raw = authError?.code?.trim() || authError?.message?.trim() || "unknown";
  const safe = raw.replace(/[^a-zA-Z0-9_:-]/g, "_").slice(0, 80);
  return `You must be signed in to continue. (rejected_token:${safe})`;
}

export async function signedInErrorForRequest(
  request: Request,
  authError?: AuthFailure,
): Promise<string> {
  const accessToken = await resolveRequestAccessToken(request);
  return signedInErrorMessage(accessToken, authError);
}
