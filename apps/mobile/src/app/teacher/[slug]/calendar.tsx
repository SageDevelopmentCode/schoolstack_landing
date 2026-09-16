import { useLocalSearchParams } from 'expo-router';

import { TeacherCalendarScreen } from '@/components/teacher/calendar/teacher-calendar-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherCalendarRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <TeacherCalendarScreen organizationId={selectedSchool.id} slug={slug} />;
}
