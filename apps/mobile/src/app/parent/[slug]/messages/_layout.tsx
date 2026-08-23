import { Stack, useLocalSearchParams } from 'expo-router';

import { MessagesRealtimeProvider } from '@/contexts/messages-realtime-context';
import { useAuth } from '@/contexts/auth-context';
import { useAdminTheme } from '@/contexts/admin-theme-context';

export default function ParentMessagesLayout() {
  const theme = useAdminTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <MessagesRealtimeProvider organizationId={selectedSchool.id}>
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
    </MessagesRealtimeProvider>
  );
}
