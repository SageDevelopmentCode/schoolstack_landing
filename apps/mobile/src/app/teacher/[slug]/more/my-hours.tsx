import { useLocalSearchParams } from 'expo-router';

import { ParentPlaceholderScreen } from '@/components/parent/parent-placeholder-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherMyHoursRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return (
    <ParentPlaceholderScreen
      slug={slug}
      schoolName={selectedSchool.name}
      title="My Hours"
      description={`Track your work hours — coming soon in the ${selectedSchool.name} mobile app.`}
    />
  );
}
