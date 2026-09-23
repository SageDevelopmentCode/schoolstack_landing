import { useLocalSearchParams } from 'expo-router';

import { SchoolAdminCommitteesScreen } from '@/components/school-admin/committees/school-admin-committees-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminCommitteesRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) return null;

  return <SchoolAdminCommitteesScreen slug={slug} organizationId={selectedSchool.id} />;
}
