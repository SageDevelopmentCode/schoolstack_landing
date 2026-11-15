import { Stack } from 'expo-router';

import { Garden } from '@/components/parent/garden/tokens';
import { CommitteeUnreadRefreshProvider } from '@/contexts/committee-unread-refresh-context';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function ParentCommitteesLayout() {
  return (
    <CommitteeUnreadRefreshProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
        contentStyle: { backgroundColor: Garden.cream },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore/[committeeId]" />
      <Stack.Screen name="workspace/[committeeId]" />
      <Stack.Screen name="workspace/[committeeId]/project/[projectId]" />
    </Stack>
    </CommitteeUnreadRefreshProvider>
  );
}
