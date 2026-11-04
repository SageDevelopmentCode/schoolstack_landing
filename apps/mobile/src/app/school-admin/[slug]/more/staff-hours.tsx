import { useLocalSearchParams } from 'expo-router';

import { SchoolAdminStaffHoursScreen } from '@/components/school-admin/staff-hours/school-admin-staff-hours-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminStaffHoursRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <SchoolAdminStaffHoursScreen organizationId={selectedSchool.id} slug={selectedSchool.slug} />
  );
}
