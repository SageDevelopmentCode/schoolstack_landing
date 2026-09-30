import { Stack } from 'expo-router';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function ProgramParentMessagesLayout() {
  const theme = useParentTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
        contentStyle: { backgroundColor: theme.paper },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[threadId]" />
    </Stack>
  );
}
