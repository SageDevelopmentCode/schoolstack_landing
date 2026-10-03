import { Stack } from 'expo-router';

import { Story } from '@/constants/story-theme';
import { CommitteeUnreadRefreshProvider } from '@/contexts/committee-unread-refresh-context';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function TeacherCommitteesLayout() {
  return (
    <CommitteeUnreadRefreshProvider>
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
        contentStyle: { backgroundColor: Story.paper },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore/[committeeId]" />
      <Stack.Screen name="workspace/[committeeId]" />
    </Stack>
    </CommitteeUnreadRefreshProvider>
  );
}
