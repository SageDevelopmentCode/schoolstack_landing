import { fetchMobilePreviewApi } from '@/lib/platform-admin/mobile-preview-api';
import type { PortalPreviewSession } from '@/lib/platform-admin/preview-session-types';
import { registerPortalMemoryClear } from '@/lib/portal-cache';
import {
  filterSchoolPortalOptionsForMobile,
  type AccountPortalId,
  type SchoolPortalOption,
} from '@/lib/auth/school-portal-options-types';

export type PreviewPortalSwitchTarget = {
  portal: PortalPreviewSession['portal'];
  membershipId?: string;
  staffMemberId?: string;
  familyId?: string;
  subjectLabel: string;
};

export type PreviewPortalOptionsPayload = {
  options: SchoolPortalOption[];
  targets: Partial<Record<AccountPortalId, PreviewPortalSwitchTarget>>;
};

const previewOptionsCache = new Map<string, PreviewPortalOptionsPayload>();
const inflightRequests = new Map<string, Promise<PreviewPortalOptionsPayload>>();

function previewPortalOptionsCacheKey(session: PortalPreviewSession): string {
  return [
    session.organizationId,
    session.slug,
    session.membershipId ?? '',
    session.staffMemberId ?? '',
    session.familyId ?? '',
  ].join(':');
}

function clearPreviewPortalOptionsCache(): void {
  previewOptionsCache.clear();
  inflightRequests.clear();
}

registerPortalMemoryClear(clearPreviewPortalOptionsCache);

function appendPreviewIdentityParams(
  path: string,
  session: Pick<
    PortalPreviewSession,
    'organizationId' | 'slug' | 'membershipId' | 'staffMemberId' | 'familyId'
  >,
): string {
  const url = new URL(path, 'https://trymudkitchen.com');
  url.searchParams.set('organizationId', session.organizationId);
  url.searchParams.set('slug', session.slug);
  if (session.membershipId) {
    url.searchParams.set('membershipId', session.membershipId);
  }
  if (session.staffMemberId) {
    url.searchParams.set('staffMemberId', session.staffMemberId);
  }
  if (session.familyId) {
    url.searchParams.set('familyId', session.familyId);
  }
  return `${url.pathname}${url.search}`;
}

async function fetchPreviewPortalOptionsUncached(
  session: PortalPreviewSession,
): Promise<PreviewPortalOptionsPayload> {
  const path = appendPreviewIdentityParams(
    '/api/admin/mobile-preview/school-admin/portal-options',
    session,
  );
  const payload = await fetchMobilePreviewApi<PreviewPortalOptionsPayload>(path);
  return {
    options: filterSchoolPortalOptionsForMobile(payload.options ?? []),
    targets: payload.targets ?? {},
  };
}

export async function fetchPreviewPortalOptions(
  session: PortalPreviewSession,
): Promise<PreviewPortalOptionsPayload> {
  const key = previewPortalOptionsCacheKey(session);
  const cached = previewOptionsCache.get(key);
  if (cached) {
    return cached;
  }

  const existing = inflightRequests.get(key);
  if (existing) {
    return existing;
  }

  const request = fetchPreviewPortalOptionsUncached(session)
    .then((payload) => {
      if (inflightRequests.get(key) === request) {
        previewOptionsCache.set(key, payload);
      }
      return payload;
    })
    .finally(() => {
      if (inflightRequests.get(key) === request) {
        inflightRequests.delete(key);
      }
    });

  inflightRequests.set(key, request);
  return request;
}

export function prefetchPreviewPortalOptions(session: PortalPreviewSession | null): void {
  if (!session) {
    return;
  }
  void fetchPreviewPortalOptions(session).catch(() => undefined);
}

export function resolvePreviewTargetForOption(
  optionId: AccountPortalId,
  targets: Partial<Record<AccountPortalId, PreviewPortalSwitchTarget>>,
): PreviewPortalSwitchTarget | null {
  return targets[optionId] ?? null;
}

export function accountPortalIdToPreviewPortal(
  optionId: AccountPortalId,
): PortalPreviewSession['portal'] | null {
  switch (optionId) {
    case 'admin':
      return 'school_admin';
    case 'teacher':
      return 'teacher';
    case 'family_parent':
      return 'parent';
    default:
      return null;
  }
}
