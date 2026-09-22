import { useLocalSearchParams } from 'expo-router';

import { SchoolDashboardScreen } from '@/components/school-admin/school-dashboard-screen';
import { useAuth } from '@/contexts/auth-context';
import { AttendanceProvider } from '@/contexts/attendance-context';

export default function SchoolAdminDashboardPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool, user } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <AttendanceProvider organizationId={selectedSchool.id} portal="school_admin">
      <SchoolDashboardScreen
        organizationId={selectedSchool.id}
        slug={selectedSchool.slug}
        schoolName={selectedSchool.name}
        user={user}
      />
    </AttendanceProvider>
  );
}
