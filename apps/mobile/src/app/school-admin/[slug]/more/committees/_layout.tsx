import { Stack } from 'expo-router';

import { Story } from '@/constants/story-theme';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function SchoolAdminCommitteesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
        contentStyle: { backgroundColor: Story.paper },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[committeeId]" />
    </Stack>
  );
}
