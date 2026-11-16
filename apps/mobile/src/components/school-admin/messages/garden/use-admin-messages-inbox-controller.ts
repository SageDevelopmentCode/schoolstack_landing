import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { useMessagesUnread } from '@/contexts/messages-unread-context';
import {
  prefetchSchoolAdminMessagesContacts,
  useSchoolAdminMessagesInbox,
} from '@/contexts/school-admin-messages-inbox-context';
import { buildAdminSectionedListItems } from '@/lib/messages/admin-thread-sections';
import { createMessageThread } from '@/lib/messages/api';
import {
  prefetchRecentSchoolAdminMessageThreads,
  prefetchSchoolAdminMessageThread,
} from '@/lib/messages/message-thread-cache';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';
import { usePortalReadOnly } from '@/lib/portal-preview-gating';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

function filterThreadsBySearch(threads: MessageThreadSummary[], query: string): MessageThreadSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return threads;
  return threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(normalized) ||
      thread.subtitle?.toLowerCase().includes(normalized) ||
      thread.lastMessagePreview?.toLowerCase().includes(normalized),
  );
}

export type StartConversationResult =
  | { ok: true; threadId: string; existing: boolean }
  | { ok: false; error: string };

/**
 * School admin inbox data, realtime, prefetching, compose-sheet sequencing and
 * conversation start (moved from `messages-list-screen.tsx`, same calls and
 * `reportError` operations). No UI, no toasts.
 */
export function useAdminMessagesInboxController({
  organizationId,
  organizationSlug,
  schoolName,
}: {
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
}) {
  const router = useRouter();
  const { refreshUnreadCount } = useMessagesUnread();
  const { reportError } = useMobileErrorReporter(organizationId);
  const readOnly = usePortalReadOnly();
  const { threads, contacts, isLoading, isRefreshing, loadingContacts, error, refresh, ensureContactsLoaded } =
    useSchoolAdminMessagesInbox();
  const { registerInboxConsumer } = useMessagesRealtime();

  const [searchQuery, setSearchQuery] = useState('');
  const [composeMenuOpen, setComposeMenuOpen] = useState(false);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [startingContactKey, setStartingContactKey] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && threads.length === 0) return;
    queueMicrotask(() => setLastUpdatedAt(Date.now()));
  }, [isLoading, threads]);

  const filteredThreads = useMemo(() => filterThreadsBySearch(threads, searchQuery), [searchQuery, threads]);
  const listItems = useMemo(() => buildAdminSectionedListItems(filteredThreads), [filteredThreads]);
  const unreadThreads = useMemo(() => threads.filter((thread) => thread.unreadCount > 0).length, [threads]);

  /** Contact keys that already have a thread ("Open" vs "Start" in the picker). */
  const existingContactKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const thread of threads) {
      const key = contactKeyForThread(thread.participants, 'admin', {});
      if (key) keys.add(key);
    }
    return keys;
  }, [threads]);

  useFocusEffect(
    useCallback(() => {
      return registerInboxConsumer({
        activeThreadId: null,
        onInboxChange: () => {
          void refresh({ silent: true });
          void refreshUnreadCount();
        },
        onThreadMessage: () => {
          // Inbox changes are handled via onInboxChange.
        },
      });
    }, [refresh, refreshUnreadCount, registerInboxConsumer]),
  );

  const refreshInbox = useCallback(async () => {
    await Promise.all([refresh({ silent: true }), refreshUnreadCount()]);
  }, [refresh, refreshUnreadCount]);

  const prefetchedThreadIdsRef = useRef<string>('');
  const pendingComposeActionRef = useRef<'bulk' | 'newConversation' | null>(null);

  const prefetchThread = useCallback(
    (threadId: string) => {
      void prefetchSchoolAdminMessageThread(organizationId, schoolName, threadId);
    },
    [organizationId, schoolName],
  );

  const openThread = useCallback(
    (threadId: string) => {
      router.push(`/school-admin/${organizationSlug}/messages/${threadId}`);
    },
    [organizationSlug, router],
  );

  useFocusEffect(
    useCallback(() => {
      void prefetchSchoolAdminMessagesContacts(organizationId, schoolName);
    }, [organizationId, schoolName]),
  );

  useFocusEffect(
    useCallback(() => {
      if (threads.length === 0) return;
      const sortedThreadIds = [...threads]
        .sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        })
        .map((thread) => thread.id);
      const threadIds = sortedThreadIds.join(',');
      if (prefetchedThreadIdsRef.current === threadIds) return;
      prefetchedThreadIdsRef.current = threadIds;
      prefetchRecentSchoolAdminMessageThreads(organizationId, schoolName, sortedThreadIds);
    }, [organizationId, schoolName, threads]),
  );

  const openComposeMenu = useCallback(() => {
    pendingComposeActionRef.current = null;
    setComposeMenuOpen(true);
  }, []);

  const closeComposeMenu = useCallback(() => {
    pendingComposeActionRef.current = null;
    setComposeMenuOpen(false);
  }, []);

  /** The compose menu has finished closing: open the sheet that was picked. */
  const onComposeMenuDismissed = useCallback(() => {
    const action = pendingComposeActionRef.current;
    pendingComposeActionRef.current = null;
    if (action === 'bulk') {
      setBroadcastOpen(true);
      void ensureContactsLoaded();
      return;
    }
    if (action === 'newConversation') {
      setNewConversationOpen(true);
      void ensureContactsLoaded();
    }
  }, [ensureContactsLoaded]);

  const requestNewConversation = useCallback(() => {
    pendingComposeActionRef.current = 'newConversation';
    setComposeMenuOpen(false);
  }, []);

  const requestBulkMessage = useCallback(() => {
    pendingComposeActionRef.current = 'bulk';
    setComposeMenuOpen(false);
  }, []);

  /**
   * Reuse an existing thread with this contact, or create one and refresh the
   * inbox. Returns where to go; the caller closes the sheet and navigates.
   */
  const startConversation = useCallback(
    async (contact: MessageContact): Promise<StartConversationResult | null> => {
      if (startingContactKey) return null;
      setStartingContactKey(contact.key);
      try {
        const existing = threads.find(
          (thread) => contactKeyForThread(thread.participants, 'admin', {}) === contact.key,
        );
        if (existing) return { ok: true, threadId: existing.id, existing: true };

        const threadId = await createMessageThread(organizationId, contact);
        await refresh({ silent: true });
        await refreshUnreadCount();
        return { ok: true, threadId, existing: false };
      } catch (selectError) {
        reportError('school_admin_message_thread_create', selectError, {
          entityType: 'message_contact',
          entityId: contact.key,
        });
        return {
          ok: false,
          error: selectError instanceof Error ? selectError.message : 'Failed to start conversation.',
        };
      } finally {
        setStartingContactKey(null);
      }
    },
    [organizationId, refresh, refreshUnreadCount, reportError, startingContactKey, threads],
  );

  const onBroadcastSent = useCallback(() => {
    void refresh({ silent: true });
    void refreshUnreadCount();
  }, [refresh, refreshUnreadCount]);

  return {
    organizationId,
    organizationSlug,
    schoolName,
    readOnly,
    status: (isLoading && threads.length === 0 ? 'loading' : 'ready') as 'loading' | 'ready',
    threads,
    contacts,
    loadingContacts,
    listItems,
    unreadThreads,
    existingContactKeys,
    searchQuery,
    setSearchQuery,
    isRefreshing,
    error,
    lastUpdatedAt,
    refresh: refreshInbox,
    prefetchThread,
    openThread,
    composeMenuOpen,
    openComposeMenu,
    closeComposeMenu,
    onComposeMenuDismissed,
    requestNewConversation,
    requestBulkMessage,
    newConversationOpen,
    setNewConversationOpen,
    broadcastOpen,
    setBroadcastOpen,
    startingContactKey,
    startConversation,
    onBroadcastSent,
  };
}

export type AdminMessagesInboxController = ReturnType<typeof useAdminMessagesInboxController>;
