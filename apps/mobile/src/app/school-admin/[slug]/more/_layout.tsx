import { Stack } from 'expo-router';

import { useAdminTheme } from '@/contexts/admin-theme-context';

export default function MoreLayout() {
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
      <Stack.Screen name="transactions" />
    </Stack>
  );
}
