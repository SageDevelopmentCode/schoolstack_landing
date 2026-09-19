import { loadMessageThread } from '@/lib/messages/api';
import { loadParentMessageThread } from '@/lib/messages/parent-api';
import { loadTeacherMessageThread } from '@/lib/messages/teacher-api';
import { createPortalCache, type PortalCache } from '@/lib/portal-cache';
import type { MessageThreadDetail } from '@/lib/messages/types';

function threadCacheKey(
  organizationId: string,
  schoolName: string,
  threadId: string,
): string {
  return `${organizationId}:${schoolName}:${threadId}`;
}

type MessageThreadCacheApi = {
  get: (
    organizationId: string,
    schoolName: string,
    threadId: string,
  ) => MessageThreadDetail | null;
  isStale: (organizationId: string, schoolName: string, threadId: string) => boolean;
  hydrateFromDisk: (
    organizationId: string,
    schoolName: string,
    threadId: string,
  ) => Promise<MessageThreadDetail | null>;
  prefetch: (
    organizationId: string,
    schoolName: string,
    threadId: string,
  ) => Promise<void>;
  fetchAndCache: (
    organizationId: string,
    schoolName: string,
    threadId: string,
    options?: { refresh?: boolean },
  ) => Promise<MessageThreadDetail>;
};

function createMessageThreadCache(
  diskPrefix: string,
  loadThread: (
    threadId: string,
    organizationId: string,
    schoolName: string,
  ) => Promise<MessageThreadDetail>,
): MessageThreadCacheApi {
  const cache: PortalCache<MessageThreadDetail> = createPortalCache<MessageThreadDetail>(diskPrefix);

  return {
    get(organizationId, schoolName, threadId) {
      return cache.get(threadCacheKey(organizationId, schoolName, threadId));
    },

    isStale(organizationId, schoolName, threadId) {
      return cache.isStale(threadCacheKey(organizationId, schoolName, threadId));
    },

    hydrateFromDisk(organizationId, schoolName, threadId) {
      return cache.hydrateFromDisk(threadCacheKey(organizationId, schoolName, threadId));
    },

    prefetch(organizationId, schoolName, threadId) {
      const key = threadCacheKey(organizationId, schoolName, threadId);
      return cache.prefetch(key, () => loadThread(threadId, organizationId, schoolName));
    },

    fetchAndCache(organizationId, schoolName, threadId, options) {
      const key = threadCacheKey(organizationId, schoolName, threadId);
      return cache.fetchAndCache(
        key,
        () => loadThread(threadId, organizationId, schoolName),
        options,
      );
    },
  };
}

const parentMessageThreadCache = createMessageThreadCache(
  'parent_message_thread:',
  loadParentMessageThread,
);

const teacherMessageThreadCache = createMessageThreadCache(
  'teacher_message_thread:',
  loadTeacherMessageThread,
);

const schoolAdminMessageThreadCache = createMessageThreadCache(
  'school_admin_message_thread:',
  loadMessageThread,
);

export function getCachedParentMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
): MessageThreadDetail | null {
  return parentMessageThreadCache.get(organizationId, schoolName, threadId);
}

export function isParentMessageThreadStale(
  organizationId: string,
  schoolName: string,
  threadId: string,
): boolean {
  return parentMessageThreadCache.isStale(organizationId, schoolName, threadId);
}

export function hydrateParentMessageThreadFromDisk(
  organizationId: string,
  schoolName: string,
  threadId: string,
): Promise<MessageThreadDetail | null> {
  return parentMessageThreadCache.hydrateFromDisk(organizationId, schoolName, threadId);
}

export function prefetchParentMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
): Promise<void> {
  return parentMessageThreadCache.prefetch(organizationId, schoolName, threadId);
}

export function fetchAndCacheParentMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
  options?: { refresh?: boolean },
): Promise<MessageThreadDetail> {
  return parentMessageThreadCache.fetchAndCache(
    organizationId,
    schoolName,
    threadId,
    options,
  );
}

export function getCachedTeacherMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
): MessageThreadDetail | null {
  return teacherMessageThreadCache.get(organizationId, schoolName, threadId);
}

export function isTeacherMessageThreadStale(
  organizationId: string,
  schoolName: string,
  threadId: string,
): boolean {
  return teacherMessageThreadCache.isStale(organizationId, schoolName, threadId);
}

export function hydrateTeacherMessageThreadFromDisk(
  organizationId: string,
  schoolName: string,
  threadId: string,
): Promise<MessageThreadDetail | null> {
  return teacherMessageThreadCache.hydrateFromDisk(organizationId, schoolName, threadId);
}

export function prefetchTeacherMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
): Promise<void> {
  return teacherMessageThreadCache.prefetch(organizationId, schoolName, threadId);
}

export function fetchAndCacheTeacherMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
  options?: { refresh?: boolean },
): Promise<MessageThreadDetail> {
  return teacherMessageThreadCache.fetchAndCache(
    organizationId,
    schoolName,
    threadId,
    options,
  );
}

export function getCachedSchoolAdminMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
): MessageThreadDetail | null {
  return schoolAdminMessageThreadCache.get(organizationId, schoolName, threadId);
}

export function isSchoolAdminMessageThreadStale(
  organizationId: string,
  schoolName: string,
  threadId: string,
): boolean {
  return schoolAdminMessageThreadCache.isStale(organizationId, schoolName, threadId);
}

export function hydrateSchoolAdminMessageThreadFromDisk(
  organizationId: string,
  schoolName: string,
  threadId: string,
): Promise<MessageThreadDetail | null> {
  return schoolAdminMessageThreadCache.hydrateFromDisk(organizationId, schoolName, threadId);
}

export function prefetchSchoolAdminMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
): Promise<void> {
  return schoolAdminMessageThreadCache.prefetch(organizationId, schoolName, threadId);
}

export function fetchAndCacheSchoolAdminMessageThread(
  organizationId: string,
  schoolName: string,
  threadId: string,
  options?: { refresh?: boolean },
): Promise<MessageThreadDetail> {
  return schoolAdminMessageThreadCache.fetchAndCache(
    organizationId,
    schoolName,
    threadId,
    options,
  );
}

const RECENT_THREAD_PREFETCH_COUNT = 2;

export function prefetchRecentParentMessageThreads(
  organizationId: string,
  schoolName: string,
  threadIds: string[],
): void {
  for (const threadId of threadIds.slice(0, RECENT_THREAD_PREFETCH_COUNT)) {
    void prefetchParentMessageThread(organizationId, schoolName, threadId);
  }
}

export function prefetchRecentTeacherMessageThreads(
  organizationId: string,
  schoolName: string,
  threadIds: string[],
): void {
  for (const threadId of threadIds.slice(0, RECENT_THREAD_PREFETCH_COUNT)) {
    void prefetchTeacherMessageThread(organizationId, schoolName, threadId);
  }
}

export function prefetchRecentSchoolAdminMessageThreads(
  organizationId: string,
  schoolName: string,
  threadIds: string[],
): void {
  for (const threadId of threadIds.slice(0, RECENT_THREAD_PREFETCH_COUNT)) {
    void prefetchSchoolAdminMessageThread(organizationId, schoolName, threadId);
  }
}
