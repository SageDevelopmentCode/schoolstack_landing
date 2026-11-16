import { Stack } from 'expo-router';

import { Garden } from '@/components/parent/garden/tokens';
import { Story } from '@/constants/story-theme';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

/** Garden screens get cream behind push transitions; Bulletin and Friday Branch keep paper. */
const GARDEN = { contentStyle: { backgroundColor: Garden.cream } } as const;

export default function MoreLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
        contentStyle: { backgroundColor: Story.paper },
      }}>
      <Stack.Screen name="transactions" options={GARDEN} />
      <Stack.Screen name="schedule" options={GARDEN} />
      <Stack.Screen name="attendance" options={GARDEN} />
      <Stack.Screen name="staff-hours" options={GARDEN} />
      <Stack.Screen name="photos" options={GARDEN} />
      <Stack.Screen name="staff" options={GARDEN} />
      <Stack.Screen name="classrooms" options={GARDEN} />
      <Stack.Screen name="committees" options={GARDEN} />
    </Stack>
  );
}
