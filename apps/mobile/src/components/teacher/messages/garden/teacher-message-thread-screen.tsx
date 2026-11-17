import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Garden, GardenFonts } from '@/components/parent/garden/tokens';
import { GErrorCard, GLink, GSkeleton } from '@/components/parent/garden/ui';
import { ParentMessageThreadGardenScreen } from '@/components/parent/messages/garden/parent-message-thread-garden-screen';
import { MessagesAvatar } from '@/components/school-admin/messages/messages-avatar';
import { useTeacherMessageThreadController } from '@/components/teacher/messages/garden/use-teacher-message-thread-controller';
import { useTeacherMessagesInbox } from '@/contexts/teacher-messages-inbox-context';
import { haptic } from '@/lib/haptics';
import { createTeacherMessageThread } from '@/lib/messages/teacher-api';
import { teacherMessageThreadRoute, teacherStudentDetailRoute } from '@/lib/teacher/teacher-nav';
import { useMobileErrorReporter } from '@/lib/use-mobile-error-reporter';

type Props = {
  threadId: string;
  organizationId: string;
  organizationSlug: string;
  schoolName: string;
  /** Set for `messages/new?contactKey=…` (Message family, deep links). */
  pendingContactKey?: string | null;
};

/**
 * Teacher › one conversation (Garden). Reuses the Garden thread (header +
 * details, day pills, bubbles with "Sent ✓", guided empty state, composer
 * inside `MessageThreadKeyboardLayout`, edit / delete sheets) on teacher data.
 */
export function TeacherMessageThreadScreen({ pendingContactKey = null, ...props }: Props) {
  const router = useRouter();
  const openStudent = useCallback(
    (studentId: string) =>
      router.push(teacherStudentDetailRoute(props.organizationSlug, studentId, { scope: 'assigned' })),
    [props.organizationSlug, router],
  );

  if (props.threadId === 'new') {
    return <TeacherNewThreadScreen {...props} pendingContactKey={pendingContactKey} />;
  }

  return (
    <ParentMessageThreadGardenScreen
      key={props.threadId}
      {...props}
      useController={useTeacherMessageThreadController}
      onStudentPress={openStudent}
    />
  );
}

/**
 * `messages/new?contactKey=…`: create the conversation with that contact, then
 * replace this route with the real thread (same API call and
 * `teacher_message_thread_create` reporting as before), with a Garden preview
 * while it works and Try again if it fails.
 */
function TeacherNewThreadScreen({
  organizationId,
  organizationSlug,
  pendingContactKey,
}: Props) {
  const router = useRouter();
  const { reportError } = useMobileErrorReporter(organizationId);
  const { contacts, hasLoaded, refresh: refreshInbox } = useTeacherMessagesInbox();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const startedRef = useRef<number | null>(null);

  const contact = useMemo(
    () => (pendingContactKey ? (contacts.find((item) => item.key === pendingContactKey) ?? null) : null),
    [contacts, pendingContactKey],
  );
  const notFound = !pendingContactKey || (hasLoaded && !contact);

  useEffect(() => {
    if (!contact || startedRef.current === attempt) return;
    startedRef.current = attempt;
    let cancelled = false;
    void (async () => {
      try {
        const newThreadId = await createTeacherMessageThread(organizationId, contact);
        if (cancelled) return;
        void refreshInbox({ silent: true });
        router.replace(teacherMessageThreadRoute(organizationSlug, newThreadId));
      } catch (createError) {
        if (cancelled) return;
        reportError('teacher_message_thread_create', createError, {
          entityType: 'message_contact',
          entityId: contact.key,
        });
        haptic.error();
        setError(createError instanceof Error ? createError.message : 'Failed to start conversation.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, contact, organizationId, organizationSlug, refreshInbox, reportError, router]);

  const back = <GLink label="Back to Messages" icon="chevron-back" reverse onPress={() => router.back()} />;

  if (notFound || error) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.errorWrap}>
        <StatusBar style="dark" />
        {back}
        <GErrorCard
          title={notFound ? "We couldn't find that contact" : "We couldn't start this conversation"}
          message={
            notFound
              ? 'Contact not found. They may not be messageable in the app yet.'
              : `${error} Check your connection, then try again.`
          }
          onRetry={() => {
            if (notFound) {
              void refreshInbox();
              return;
            }
            setError(null);
            setAttempt((value) => value + 1);
          }}
        />
      </ScrollView>
    );
  }

  return (
    <View style={styles.root} accessibilityLabel="Starting your conversation">
      <StatusBar style="dark" />
      <View style={styles.header}>
        {back}
        <View style={styles.who}>
          {contact ? (
            <MessagesAvatar
              name={contact.name}
              color={contact.color}
              photoUrl={contact.profilePhotoUrl ?? null}
              size="lg"
            />
          ) : (
            <GSkeleton style={styles.avatarSkeleton} />
          )}
          <View style={styles.whoCopy}>
            <Text style={styles.title} numberOfLines={1}>
              {contact?.name ?? 'Finding your contact…'}
            </Text>
            <Text style={styles.status} accessibilityLiveRegion="polite">
              Starting your conversation…
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.body}>
        <GSkeleton style={[styles.bubble, { width: '58%' }]} />
        <GSkeleton style={[styles.bubble, styles.own, { width: '46%' }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Garden.cream },
  errorWrap: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: Garden.ink10,
  },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  whoCopy: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontFamily: GardenFonts.display, fontSize: 22, color: Garden.ink },
  status: { fontFamily: GardenFonts.bodySemi, fontSize: 13.5, color: Garden.soft },
  avatarSkeleton: { width: 48, height: 48, borderRadius: 24 },
  body: { padding: 16, gap: 12 },
  bubble: { height: 46, borderRadius: 18 },
  own: { alignSelf: 'flex-end' },
});
