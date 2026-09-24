import "server-only";

import { headers as getNextHeaders } from "next/headers";

import {
  getBearerAccessToken,
  readAccessTokenFromHeaders,
  signedInErrorMessage,
} from "./bearer-token";

type AuthFailure = {
  message?: string;
  code?: string;
} | null;

/**
 * Bearer JWT from the request, then from Next.js `headers()` when the
 * Authorization header is hidden from the route `Request` object.
 */
export async function resolveRequestAccessToken(
  request: Request,
): Promise<string | null> {
  const fromRequest = getBearerAccessToken(request);
  if (fromRequest) return fromRequest;

  try {
    const headerStore = await getNextHeaders();
    return readAccessTokenFromHeaders(headerStore);
  } catch {
    return null;
  }
}

export async function signedInErrorForRequest(
  request: Request,
  authError?: AuthFailure,
): Promise<string> {
  const accessToken = await resolveRequestAccessToken(request);
  return signedInErrorMessage(accessToken, authError);
}
