import { useLocalSearchParams } from 'expo-router';

import { ParentFridayBranchScreen } from '@/components/parent/friday-branch/parent-friday-branch-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentFridayBranchRoute() {
  const { slug, classId } = useLocalSearchParams<{ slug: string; classId?: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return (
    <ParentFridayBranchScreen
      slug={slug}
      organizationId={selectedSchool.id}
      initialClassId={classId ?? null}
    />
  );
}
