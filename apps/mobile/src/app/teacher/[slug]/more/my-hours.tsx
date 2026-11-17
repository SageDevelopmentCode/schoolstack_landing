import { useLocalSearchParams } from 'expo-router';

import { TeacherMyHoursGardenScreen } from '@/components/teacher/my-hours/garden/teacher-my-hours-garden-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherMyHoursRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return <TeacherMyHoursGardenScreen organizationId={selectedSchool.id} slug={slug} />;
}
