import { useLocalSearchParams } from 'expo-router';

import { ParentPhotosScreen } from '@/components/parent/parent-photos-screen';
import { ParentProgramRoutePlaceholder } from '@/components/parent/parent-program-route-placeholder';
import { useAuth } from '@/contexts/auth-context';
import { useParentPortalContext } from '@/contexts/parent-portal-context';

export default function ProgramParentPhotosRoute() {
  const { slug, programSlug } = useLocalSearchParams<{
    slug: string;
    programSlug: string;
  }>();
  const { selectedSchool } = useAuth();
  const { programsByPortalSlug, isLoading } = useParentPortalContext();

  if (!slug || !selectedSchool || !programSlug) return null;

  const program = programsByPortalSlug[programSlug];
  if (isLoading || !program) {
    return <ParentProgramRoutePlaceholder title="Photos" />;
  }

  return (
    <ParentPhotosScreen
      organizationId={selectedSchool.id}
      slug={slug}
      programId={program.programId}
    />
  );
}
