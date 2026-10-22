import { useParentPortalContext } from '@/contexts/parent-portal-context';

export function useParentPortalProgramId(): string | undefined {
  const { activeProgramSlug, programsByPortalSlug } = useParentPortalContext();
  if (!activeProgramSlug) return undefined;
  return programsByPortalSlug[activeProgramSlug]?.programId;
}
