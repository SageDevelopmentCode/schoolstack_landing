import {
  assertApiAuthenticated,
  getApiAuthHeaders,
} from '@/lib/auth/auth-session';
import {
  assertPreviewWriteAllowed,
  getActivePreviewSession,
  MOBILE_PREVIEW_HEADER,
} from '@/lib/platform-admin/preview-session-store';
import type { PortalPreviewSession } from '@/lib/platform-admin/preview-session-types';

const siteUrl = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://trymudkitchen.com';

type FetchMobilePreviewApiOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

function appendPreviewParams(path: string, session: PortalPreviewSession): string {
  const url = new URL(path.startsWith('http') ? path : `${siteUrl}${path}`);
  url.searchParams.set('organizationId', session.organizationId);
  url.searchParams.set('slug', session.slug);
  if (session.familyId) {
    url.searchParams.set('familyId', session.familyId);
  }
  if (session.staffMemberId) {
    url.searchParams.set('staffMemberId', session.staffMemberId);
  }
  if (session.membershipId) {
    url.searchParams.set('membershipId', session.membershipId);
  }
  return `${url.pathname}${url.search}`;
}

export function mapParentPortalPathToPreview(path: string, session: PortalPreviewSession): string {
  const normalized = path.startsWith('http') ? new URL(path).pathname + new URL(path).search : path;
  const withoutOrigin = normalized.replace(/^\/api\/parent-portal\//, '');
  return appendPreviewParams(`/api/admin/mobile-preview/parent/${withoutOrigin}`, session);
}

export function mapTeacherPortalPathToPreview(path: string, session: PortalPreviewSession): string {
  const normalized = path.startsWith('http') ? new URL(path).pathname + new URL(path).search : path;
  const withoutOrigin = normalized.replace(/^\/api\/teacher-portal\//, '');
  return appendPreviewParams(`/api/admin/mobile-preview/teacher/${withoutOrigin}`, session);
}

export async function fetchMobilePreviewApi<T>(
  path: string,
  options: FetchMobilePreviewApiOptions = {},
): Promise<T> {
  assertPreviewWriteAllowed(options.method);

  const headers = await getApiAuthHeaders(options.body !== undefined);
  headers[MOBILE_PREVIEW_HEADER] = '1';

  const response = await fetch(`${siteUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  await assertApiAuthenticated(response);
  if (!response.ok) {
    throw new Error(typeof payload.error === 'string' ? payload.error : 'Request failed.');
  }

  return payload;
}

export function resolveParentPreviewPath(path: string): string | null {
  const session = getActivePreviewSession();
  if (!session || session.portal !== 'parent' || !session.familyId) return null;
  return mapParentPortalPathToPreview(path, session);
}

export function resolveTeacherPreviewPath(path: string): string | null {
  const session = getActivePreviewSession();
  if (!session || session.portal !== 'teacher' || !session.staffMemberId) return null;
  return mapTeacherPortalPathToPreview(path, session);
}
