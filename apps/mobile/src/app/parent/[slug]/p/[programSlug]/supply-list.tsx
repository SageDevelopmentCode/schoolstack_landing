import { useLocalSearchParams } from 'expo-router';

import { ParentCoopSupplyListScreen } from '@/components/parent/coop/parent-coop-supply-list-screen';
import { useAuth } from '@/contexts/auth-context';
import { useParentPortalContext } from '@/contexts/parent-portal-context';

export default function ProgramParentSupplyListRoute() {
  const { slug, programSlug } = useLocalSearchParams<{ slug: string; programSlug: string }>();
  const { selectedSchool } = useAuth();
  const { programsByPortalSlug } = useParentPortalContext();

  if (!slug || !programSlug || !selectedSchool) return null;
  const program = programsByPortalSlug[programSlug];
  if (!program) return null;

  return (
    <ParentCoopSupplyListScreen
      organizationId={selectedSchool.id}
      programId={program.programId}
    />
  );
}
