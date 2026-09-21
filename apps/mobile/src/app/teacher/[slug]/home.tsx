import { useLocalSearchParams } from 'expo-router';

import { TeacherHomeScreen } from '@/components/teacher/teacher-home-screen';
import { useAuth } from '@/contexts/auth-context';
import { AttendanceProvider } from '@/contexts/attendance-context';

export default function TeacherHomeRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <AttendanceProvider organizationId={selectedSchool.id} portal="teacher">
      <TeacherHomeScreen slug={slug} />
    </AttendanceProvider>
  );
}
