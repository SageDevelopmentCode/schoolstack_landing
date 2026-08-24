import { useLocalSearchParams } from 'expo-router';

import { ParentCalendarScreen } from '@/components/parent/calendar/parent-calendar-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentCalendarRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return (
    <ParentCalendarScreen organizationId={selectedSchool.id} />
  );
}
