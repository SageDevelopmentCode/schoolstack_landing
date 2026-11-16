import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import type {
  ParentMessagesInboxController,
  StartConversationResult,
} from '@/components/parent/messages/garden/use-parent-messages-inbox-controller';
import { useMessagesRealtime } from '@/contexts/messages-realtime-context';
import { useTeacherHome } from '@/contexts/teacher-home-context';
import { useTeacherMessagesInbox } from '@/contexts/teacher-messages-inbox-context';
import {
  prefetchRecentTeacherMessageThreads,
  prefetchTeacherMessageThread,
} from '@/lib/messages/message-thread-cache';
import { countUnreadThreads, filterThreadsByTab, type ParentInboxTab } from '@/lib/messages/parent-inbox-filters';
import { contactKeyForThread } from '@/lib/messages/participants-from-contact';
import { isMudKitchenSupportPlaceholder, prepareMobileInboxThreads } from '@/lib/messages/platform-support';
import { createTeacherMessageThread } from '@/lib/messages/teacher-api';
import type { MessageContact, MessageThreadSummary } from '@/lib/messages/types';
import { isTeacherFeatureEnabled } from '@/lib/teacher/teacher-features';
import { teacherMessageThreadRoute, teacherStudentDetailRoute } from '@/lib/teacher/teacher-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type Params = { organizationId: string; organizationSlug: string; schoolName: string };

/**
 * Teacher Messages inbox data + callbacks in the shape the Garden inbox screen
 * takes. Same behaviour as the Story list: `messages` feature gate, pinned
 * MudKitchen Support, search, realtime refresh on focus, prefetch. New: an
 * All / Unread filter, and a new conversation is created inside the sheet
 * (`teacher_message_thread_create`) before the thread opens.
 */
export function useTeacherMessagesInboxController({ organizationId, organizationSlug, schoolName }: Params) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { data: homeData } = useTeacherHome();
  const messagesEnabled = isTeacherFeatureEnabled(homeData?.features, 'messages');
  const { threads, contacts, staffMemberId, isLoading, isRefreshing, error, refresh } = useTeacherMessagesInbox();

  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<ParentInboxTab>('all');
  const [startingContactKey, setStartingContactKey] = useState<string | null>(null);

  const pinScope = useMemo(
    () => (staffMemberId ? { mode: 'teacher' as const, staffMemberId } : null),
    [staffMemberId],
  );
  const searchedThreads = useMemo(
    () => prepareMobileInboxThreads(threads, pinScope, searchQuery),
    [pinScope, searchQuery, threads],
  );
  const visibleThreads = useMemo(() => filterThreadsByTab(searchedThreads, tab), [searchedThreads, tab]);
  const unreadThreads = useMemo(() => threads.filter((thread) => thread.unreadCount > 0), [threads]);
  const unreadCount = useMemo(() => countUnreadThreads(threads), [threads]);
  const existingContactKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const thread of threads) {
      const key = contactKeyForThread(thread.participants, 'teacher', { staffMemberId });
      if (key) keys.add(key);
    }
    return keys;
  }, [staffMemberId, threads]);

  const { registerInboxConsumer } = useMessagesRealtime();

  useFocusEffect(
    useCallback(() => {
      if (!messagesEnabled) return undefined;
      return registerInboxConsumer({
        activeThreadId: null,
        onInboxChange: () => {
          void refresh({ silent: true });
        },
        onThreadMessage: () => {
          // Inbox changes are handled via onInboxChange.
        },
      });
    }, [messagesEnabled, refresh, registerInboxConsumer]),
  );

  const prefetchedThreadIdsRef = useRef<string>('');

  const prefetchThread = useCallback(
    (threadId: string) => {
      if (isMudKitchenSupportPlaceholder(threadId)) return;
      void prefetchTeacherMessageThread(organizationId, schoolName, threadId);
    },
    [organizationId, schoolName],
  );

  useFocusEffect(
    useCallback(() => {
      if (!messagesEnabled || searchedThreads.length === 0) return;
      const ids = searchedThreads
        .filter((thread) => !isMudKitchenSupportPlaceholder(thread.id))
        .map((thread) => thread.id);
      const key = ids.join(',');
      if (prefetchedThreadIdsRef.current === key) return;
      prefetchedThreadIdsRef.current = key;
      prefetchRecentTeacherMessageThreads(organizationId, schoolName, ids);
    }, [messagesEnabled, organizationId, schoolName, searchedThreads]),
  );

  const openThread = useCallback(
    (threadId: string) => router.push(teacherMessageThreadRoute(organizationSlug, threadId)),
    [organizationSlug, router],
  );

  const openStudent = useCallback(
    (studentId: string) => router.push(teacherStudentDetailRoute(organizationSlug, studentId, { scope: 'assigned' })),
    [organizationSlug, router],
  );

  const findExistingThread = useCallback(
    (contact: MessageContact): MessageThreadSummary | undefined =>
      threads.find(
        (thread) => contactKeyForThread(thread.participants, 'teacher', { staffMemberId }) === contact.key,
      ),
    [staffMemberId, threads],
  );

  /** Existing conversation, or create one (then refresh the inbox). Does not navigate. */
  const startConversation = useCallback(
    async (contact: MessageContact): Promise<StartConversationResult> => {
      if (startingContactKey) return { ok: false, error: 'Already starting a conversation.' };
      setStartingContactKey(contact.key);
      try {
        const existing = findExistingThread(contact);
        if (existing) return { ok: true, threadId: existing.id, existing: true };
        const threadId = await createTeacherMessageThread(organizationId, contact);
        await refresh({ silent: true });
        return { ok: true, threadId, existing: false };
      } catch (createError) {
        reportError('teacher_message_thread_create', createError, {
          entityType: 'message_contact',
          entityId: contact.key,
        });
        return {
          ok: false,
          error: createError instanceof Error ? createError.message : 'Failed to start conversation.',
        };
      } finally {
        setStartingContactKey(null);
      }
    },
    [findExistingThread, organizationId, refresh, reportError, startingContactKey],
  );

  const screen: ParentMessagesInboxController = {
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

  return {
    screen,
    openStudent,
    /** Home features not loaded yet: don't flash "Messages unavailable". */
    homeLoaded: Boolean(homeData),
    messagesEnabled,
  };
}
