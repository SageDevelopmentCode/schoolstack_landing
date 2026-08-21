import { useLocalSearchParams } from 'expo-router';

import { StudentsListScreen } from '@/components/school-admin/students-list-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminStudentsPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <StudentsListScreen organizationId={selectedSchool.id} slug={selectedSchool.slug} />
  );
}
