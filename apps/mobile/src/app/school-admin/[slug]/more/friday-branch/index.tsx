import { useLocalSearchParams } from 'expo-router';

import { SchoolAdminFridayBranchScreen } from '@/components/school-admin/friday-branch/school-admin-friday-branch-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminFridayBranchRoute() {
  const { slug, classId } = useLocalSearchParams<{ slug: string; classId?: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) return null;

  return (
    <SchoolAdminFridayBranchScreen
      organizationId={selectedSchool.id}
      initialClassId={typeof classId === 'string' ? classId : null}
    />
  );
}
