import { Stack } from 'expo-router';

import { Garden } from '@/components/parent/garden/tokens';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function SchoolAdminCommitteesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
        // Garden screens: cream behind push transitions.
        contentStyle: { backgroundColor: Garden.cream },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[committeeId]" />
      <Stack.Screen name="[committeeId]/project/[projectId]" />
    </Stack>
  );
}
