import { fetchSchoolPortalOptions } from '@/lib/auth/school-portal-options-api';
import {
  filterSchoolPortalOptionsForMobile,
  type SchoolPortalOption,
} from '@/lib/auth/school-portal-options-types';
import { getSupabaseClient } from '@/lib/supabase';

type CacheEntry = {
  options: SchoolPortalOption[];
};

const optionsCache = new Map<string, CacheEntry>();
const inflightRequests = new Map<string, Promise<SchoolPortalOption[]>>();

export function schoolPortalOptionsCacheKey(
  userId: string,
  organizationId: string,
  slug: string,
): string {
  return `${userId}:${organizationId}:${slug}`;
}

function schoolCacheSuffix(organizationId: string, slug: string): string {
  return `:${organizationId}:${slug}`;
}

async function resolveSessionUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();
  return session?.user?.id ?? null;
}

export function readCachedSchoolPortalOptions(
  userId: string,
  organizationId: string,
  slug: string,
): SchoolPortalOption[] | null {
  return optionsCache.get(schoolPortalOptionsCacheKey(userId, organizationId, slug))?.options ?? null;
}

export async function prefetchSchoolPortalOptions(
  organizationId: string,
  slug: string,
): Promise<SchoolPortalOption[]> {
  const userId = await resolveSessionUserId();
  if (!userId) {
    return [];
  }

  const key = schoolPortalOptionsCacheKey(userId, organizationId, slug);
  const cached = optionsCache.get(key);
  if (cached) {
    return cached.options;
  }

  const existing = inflightRequests.get(key);
  if (existing) {
    return existing;
  }

  const request = fetchSchoolPortalOptions(organizationId, slug)
    .then((raw) => {
      const options = filterSchoolPortalOptionsForMobile(raw);
      if (inflightRequests.get(key) === request) {
        optionsCache.set(key, { options });
      }
      return options;
    })
    .finally(() => {
      if (inflightRequests.get(key) === request) {
        inflightRequests.delete(key);
      }
    });

  inflightRequests.set(key, request);
  return request;
}

export function clearSchoolPortalOptionsCache(): void {
  optionsCache.clear();
  inflightRequests.clear();
}

export function invalidateSchoolPortalOptionsCache(organizationId: string, slug: string): void {
  const suffix = schoolCacheSuffix(organizationId, slug);
  for (const key of optionsCache.keys()) {
    if (key.endsWith(suffix)) {
      optionsCache.delete(key);
    }
  }
  for (const key of inflightRequests.keys()) {
    if (key.endsWith(suffix)) {
      inflightRequests.delete(key);
    }
  }
}
