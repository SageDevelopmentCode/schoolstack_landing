import { useLocalSearchParams } from 'expo-router';

import { ParentPlaceholderScreen } from '@/components/parent/parent-placeholder-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentCalendarRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return (
    <ParentPlaceholderScreen
      slug={slug}
      schoolName={selectedSchool.name}
      title="Calendar / events"
      description="View school events and your family calendar — coming soon in the mobile app."
    />
  );
}
