import { useLocalSearchParams } from 'expo-router';

import { StudentDetailScreen } from '@/components/school-admin/student-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminStudentDetailPage() {
  const { slug, id } = useLocalSearchParams<{ slug: string; id: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug || !id) {
    return null;
  }

  return (
    <StudentDetailScreen organizationId={selectedSchool.id} studentId={id} slug={slug} />
  );
}
