import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { PortalMudKitchenSupportMessagesCard } from '@/components/portal/portal-mudkitchen-support-messages-card';
import { useTeacherMessagesInbox } from '@/contexts/teacher-messages-inbox-context';
import { resolveMudKitchenSupportNavigationThreadId } from '@/lib/messages/platform-support';
import { teacherMessageThreadRoute } from '@/lib/teacher/teacher-nav';

type TeacherPortalMudKitchenSupportMessagesCardProps = {
  slug: string;
  messagesEnabled: boolean;
};

export function TeacherPortalMudKitchenSupportMessagesCard({
  slug,
  messagesEnabled,
}: TeacherPortalMudKitchenSupportMessagesCardProps) {
  const router = useRouter();
  const { threads, staffMemberId } = useTeacherMessagesInbox();

  const scope = useMemo(
    () => (staffMemberId ? { mode: 'teacher' as const, staffMemberId } : null),
    [staffMemberId],
  );

  const onPress = useCallback(() => {
    if (!scope) return;
    const threadId = resolveMudKitchenSupportNavigationThreadId(threads, scope);
    router.push(teacherMessageThreadRoute(slug, threadId));
  }, [router, scope, slug, threads]);

  if (!messagesEnabled || !scope) {
    return null;
  }

  return <PortalMudKitchenSupportMessagesCard onPress={onPress} />;
}
