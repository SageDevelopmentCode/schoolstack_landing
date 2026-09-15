import { Stack } from 'expo-router';

import { useParentTheme } from '@/contexts/parent-theme-context';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function ParentMessagesLayout() {
  const theme = useParentTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
        contentStyle: { backgroundColor: theme.paper },
        headerStyle: { backgroundColor: theme.white },
        headerTintColor: theme.primary,
        headerTitleStyle: { color: theme.ink },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[threadId]" options={{ headerShown: false }} />
    </Stack>
  );
}
