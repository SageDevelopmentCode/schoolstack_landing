import { useLocalSearchParams } from 'expo-router';

import { ClassroomsListScreen } from '@/components/school-admin/classrooms/classrooms-list-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminClassroomsListPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return <ClassroomsListScreen slug={selectedSchool.slug} />;
}
