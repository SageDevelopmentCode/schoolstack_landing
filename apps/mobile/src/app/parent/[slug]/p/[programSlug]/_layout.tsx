import { Redirect, Slot, useLocalSearchParams } from 'expo-router';

import { ParentHomeSkeleton } from '@/components/parent/parent-home-skeleton';
import { ParentProgramHomeProvider } from '@/contexts/parent-program-home-context';
import { useParentPortalContext } from '@/contexts/parent-portal-context';
import { useAuth } from '@/contexts/auth-context';

export default function ProgramParentPortalLayout() {
  const { programSlug } = useLocalSearchParams<{ programSlug: string }>();
  const { slug, organizationId, programsByPortalSlug, isLoading } = useParentPortalContext();
  const { user, isLoading: authLoading } = useAuth();

  if (isLoading) {
    return <ParentHomeSkeleton />;
  }

  if (!programSlug || !programsByPortalSlug[programSlug]) {
    return <Redirect href={`/parent/${slug}/home`} />;
  }

  const authReady = !authLoading && Boolean(user);

  return (
    <ParentProgramHomeProvider
      organizationId={organizationId}
      slug={slug}
      programSlug={programSlug}
      authReady={authReady}>
      <Slot />
    </ParentProgramHomeProvider>
  );
}
