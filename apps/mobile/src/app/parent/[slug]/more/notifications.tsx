import { useLocalSearchParams } from 'expo-router';

import { ParentNotificationSettingsScreen } from '@/components/parent/parent-notification-settings-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentNotificationsRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <ParentNotificationSettingsScreen />;
}
