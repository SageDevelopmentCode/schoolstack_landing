import { useLocalSearchParams } from 'expo-router';

import { StaffListScreen } from '@/components/school-admin/staff/staff-list-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminStaffListPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return <StaffListScreen slug={selectedSchool.slug} />;
}
