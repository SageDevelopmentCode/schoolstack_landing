import { Stack } from 'expo-router';

import { useAdminTheme } from '@/contexts/admin-theme-context';
import { Story } from '@/constants/story-theme';
import { detailStackAnimation } from '@/lib/motion/portal-motion';

export default function MoreLayout() {
  const theme = useAdminTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: detailStackAnimation(),
        contentStyle: { backgroundColor: Story.paper },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.accent,
        headerTitleStyle: { color: theme.textPrimary },
      }}>
      <Stack.Screen name="transactions" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="attendance" />
      <Stack.Screen name="staff" />
    </Stack>
  );
}
