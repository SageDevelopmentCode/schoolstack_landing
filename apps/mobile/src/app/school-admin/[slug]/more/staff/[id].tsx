import { useLocalSearchParams } from 'expo-router';

import { StaffDetailScreen } from '@/components/school-admin/staff/staff-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminStaffDetailPage() {
  const { slug, id } = useLocalSearchParams<{ slug: string; id: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug || !id) {
    return null;
  }

  return (
    <StaffDetailScreen
      slug={selectedSchool.slug}
      staffMemberId={id}
    />
  );
}
