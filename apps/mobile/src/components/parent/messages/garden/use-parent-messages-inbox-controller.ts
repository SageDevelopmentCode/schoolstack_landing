import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { useParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { useParentPortalContext } from '@/contexts/parent-portal-context';
import {
  prefetchParentMessageThread,
  prefetchRecentParentMessageThreads,
} from '@/lib/messages/message-thread-cache';
import { createParentMessageThread } from '@/lib/messages/parent-api';
import {
  contactKeysWithThreads,
  countUnreadThreads,
  filterThreadsByTab,
  type ParentInboxTab,
} from '@/lib/messages/parent-inbox-filters';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import {
  isMudKitchenSupportPlaceholder,
  prepareMobileInboxThreads,
} from '@/lib/messages/platform-support';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';
import { parentProgramMessageThreadRoute } from '@/lib/parent/parent-nav';
import { useParentPortalProgramId } from '@/lib/parent/use-parent-portal-program-id';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

export type StartConversationResult =
  | { ok: true; threadId: string; existing: boolean }
  | { ok: false; error: string };

export type ParentMessagesInboxControllerParams = {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
};

/**
 * Data + every callback for the parent Messages inbox (no UI). Same behaviour
 * as the old `ParentMessagesListScreen`: pinned MudKitchen Support, search,
 * realtime refresh, prefetch, program-aware navigation, start-or-open thread.
 */
export function useParentMessagesInboxController({
  organizationId,
  organizationSlug,
  schoolName,
}: ParentMessagesInboxControllerParams) {
  const router = useRouter();
  const { activeProgramSlug } = useParentPortalContext();
  const programId = useParentPortalProgramId();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { threads, contacts, guardianId, isLoading, isRefreshing, error, refresh } =
    useParentMessagesInbox();

  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<ParentInboxTab>('all');
  const [startingContactKey, setStartingContactKey] = useState<string | null>(null);

  const pinScope = useMemo(
    () => (guardianId ? { mode: 'parent' as const, guardianId } : null),
    [guardianId],
  );
  /** Pinned + sorted + search-filtered (unchanged helper). */
  const searchedThreads = useMemo(
    () => prepareMobileInboxThreads(threads, pinScope, searchQuery),
    [pinScope, searchQuery, threads],
  );
  const visibleThreads = useMemo(
    () => filterThreadsByTab(searchedThreads, tab),
    [searchedThreads, tab],
  );
  const unreadThreads = useMemo(
    () => threads.filter((thread) => thread.unreadCount > 0),
    [threads],
  );
  const unreadCount = useMemo(() => countUnreadThreads(threads), [threads]);
  const existingContactKeys = useMemo(
    () => contactKeysWithThreads(threads, guardianId),
    [guardianId, threads],
  );

  const { registerInboxConsumer } = useMessagesRealtime();

  useFocusEffect(
    useCallback(() => {
      return registerInboxConsumer({
        activeThreadId: null,
        onInboxChange: () => {
          void refresh({ silent: true });
        },
        onThreadMessage: () => {
          // Inbox changes are handled via onInboxChange.
        },
      });
    }, [refresh, registerInboxConsumer]),
  );

  const prefetchedThreadIdsRef = useRef<string>('');

  const prefetchThread = useCallback(
    (threadId: string) => {
      if (isMudKitchenSupportPlaceholder(threadId)) return;
      void prefetchParentMessageThread(organizationId, schoolName, threadId);
    },
    [organizationId, schoolName],
  );

  useFocusEffect(
    useCallback(() => {
      if (searchedThreads.length === 0) return;
      const ids = searchedThreads
        .filter((thread) => !isMudKitchenSupportPlaceholder(thread.id))
        .map((thread) => thread.id);
      const key = ids.join(',');
      if (prefetchedThreadIdsRef.current === key) return;
      prefetchedThreadIdsRef.current = key;
      prefetchRecentParentMessageThreads(organizationId, schoolName, ids);
    }, [organizationId, schoolName, searchedThreads]),
  );

  const openThread = useCallback(
    (threadId: string) => {
      if (activeProgramSlug) {
        router.push(parentProgramMessageThreadRoute(organizationSlug, activeProgramSlug, threadId));
        return;
      }
      router.push(`/parent/${organizationSlug}/messages/${threadId}`);
    },
    [activeProgramSlug, organizationSlug, router],
  );

  const findExistingThread = useCallback(
    (contact: MessageContact): MessageThreadSummary | undefined =>
      threads.find(
        (thread) =>
          contactKeyForThread(thread.participants, 'parent', { guardianId }) === contact.key,
      ),
    [guardianId, threads],
  );

  /**
   * Resolve a contact to a thread id: the existing conversation, or a new one
   * (create → refresh inbox). Does NOT navigate, so the sheet can close first.
   */
  const startConversation = useCallback(
    async (contact: MessageContact): Promise<StartConversationResult> => {
      if (startingContactKey) return { ok: false, error: 'Already starting a conversation.' };
      setStartingContactKey(contact.key);
      try {
        const existing = findExistingThread(contact);
        if (existing) {
          return { ok: true, threadId: existing.id, existing: true };
        }
        const threadId = await createParentMessageThread(organizationId, contact, { programId });
        await refresh({ silent: true });
        return { ok: true, threadId, existing: false };
      } catch (selectError) {
        reportError('parent_message_thread_create', selectError);
        return {
          ok: false,
          error:
            selectError instanceof Error ? selectError.message : 'Failed to start conversation.',
        };
      } finally {
        setStartingContactKey(null);
      }
    },
    [findExistingThread, organizationId, programId, refresh, reportError, startingContactKey],
  );

  return {
    schoolName,
    threads,
    contacts,
    searchedThreads,
    visibleThreads,
    unreadThreads,
    unreadCount,
    existingContactKeys,
    isLoading,
    isRefreshing,
    error,
    refresh,
    searchQuery,
    setSearchQuery,
    tab,
    setTab,
    openThread,
    prefetchThread,
    findExistingThread,
    startConversation,
    startingContactKey,
  };
}

export type ParentMessagesInboxController = ReturnType<typeof useParentMessagesInboxController>;
