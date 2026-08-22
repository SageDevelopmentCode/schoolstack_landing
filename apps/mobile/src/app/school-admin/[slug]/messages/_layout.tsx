import { Stack } from 'expo-router';

import { useAdminTheme } from '@/contexts/admin-theme-context';

export default function MessagesLayout() {
  const theme = useAdminTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.accent,
        headerTitleStyle: { color: theme.textPrimary },
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[threadId]" options={{ headerShown: false }} />
    </Stack>
  );
}
