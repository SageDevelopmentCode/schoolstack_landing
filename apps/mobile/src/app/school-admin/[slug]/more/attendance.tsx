import { useLocalSearchParams } from 'expo-router';

import { AttendanceScreen } from '@/components/attendance/attendance-screen';
import { useAuth } from '@/contexts/auth-context';
import { AttendanceProvider } from '@/contexts/attendance-context';

export default function SchoolAdminAttendanceRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <AttendanceProvider organizationId={selectedSchool.id} portal="school_admin">
      <AttendanceScreen title="Attendance" />
    </AttendanceProvider>
  );
}
