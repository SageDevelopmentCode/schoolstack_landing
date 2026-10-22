import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';

import { PortalMudKitchenSupportMessagesCard } from '@/components/portal/portal-mudkitchen-support-messages-card';
import { useParentMessagesInbox } from '@/contexts/parent-messages-inbox-context';
import { resolveMudKitchenSupportNavigationThreadId } from '@/lib/messages/platform-support';
import { parentMessageThreadRoute } from '@/lib/parent/parent-nav';

type ParentPortalMudKitchenSupportMessagesCardProps = {
  slug: string;
  messagesEnabled: boolean;
};

export function ParentPortalMudKitchenSupportMessagesCard({
  slug,
  messagesEnabled,
}: ParentPortalMudKitchenSupportMessagesCardProps) {
  const router = useRouter();
  const { threads, guardianId } = useParentMessagesInbox();

  const scope = useMemo(
    () => (guardianId ? { mode: 'parent' as const, guardianId } : null),
    [guardianId],
  );

  const onPress = useCallback(() => {
    if (!scope) return;
    const threadId = resolveMudKitchenSupportNavigationThreadId(threads, scope);
    router.push(parentMessageThreadRoute(slug, threadId));
  }, [router, scope, slug, threads]);

  if (!messagesEnabled || !scope) {
    return null;
  }

  return <PortalMudKitchenSupportMessagesCard onPress={onPress} />;
}
