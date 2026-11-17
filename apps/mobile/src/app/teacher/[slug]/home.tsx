import { useLocalSearchParams } from 'expo-router';

import { TeacherGardenHomeScreen } from '@/components/teacher/home/garden/teacher-garden-home-screen';
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
      <TeacherGardenHomeScreen slug={slug} />
    </AttendanceProvider>
  );
}
