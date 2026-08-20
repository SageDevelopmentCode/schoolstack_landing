import { Stack } from 'expo-router';

import { AdminShellThemeProvider } from '@/contexts/admin-theme-context';

export default function PlatformAdminLayout() {
  return (
    <AdminShellThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AdminShellThemeProvider>
  );
}
