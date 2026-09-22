import { useLocalSearchParams } from 'expo-router';

import { AttendanceScreen } from '@/components/attendance/attendance-screen';
import { useAuth } from '@/contexts/auth-context';
import { AttendanceProvider } from '@/contexts/attendance-context';

export default function TeacherAttendanceRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <AttendanceProvider organizationId={selectedSchool.id} portal="teacher">
      <AttendanceScreen title="Attendance" />
    </AttendanceProvider>
  );
}
