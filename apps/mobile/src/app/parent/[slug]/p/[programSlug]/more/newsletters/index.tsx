import { useLocalSearchParams } from 'expo-router';

import { ParentNewslettersScreen } from '@/components/parent/newsletters/parent-newsletters-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ProgramParentNewslettersRoute() {
  const { slug, programSlug } = useLocalSearchParams<{ slug: string; programSlug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !programSlug || !selectedSchool) return null;

  return (
    <ParentNewslettersScreen
      slug={slug}
      organizationId={selectedSchool.id}
      programSlug={programSlug}
    />
  );
}
