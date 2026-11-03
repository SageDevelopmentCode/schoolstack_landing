import { useLocalSearchParams } from 'expo-router';

import { TeacherMyHoursScreen } from '@/components/teacher/my-hours/teacher-my-hours-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherMyHoursRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <TeacherMyHoursScreen organizationId={selectedSchool.id} slug={slug} />
  );
}
