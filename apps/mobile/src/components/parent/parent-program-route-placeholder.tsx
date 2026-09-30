import { useLocalSearchParams } from 'expo-router';

import { ParentProgramPlaceholderScreen } from '@/components/parent/parent-program-placeholder-screen';
import { useParentPortalContext } from '@/contexts/parent-portal-context';

type ParentProgramRoutePlaceholderProps = {
  title: string;
};

export function ParentProgramRoutePlaceholder({ title }: ParentProgramRoutePlaceholderProps) {
  const { programSlug } = useLocalSearchParams<{ programSlug: string }>();
  const { programsByPortalSlug } = useParentPortalContext();
  const programLabel =
    programSlug != null ? programsByPortalSlug[programSlug]?.displayLabel : undefined;

  return <ParentProgramPlaceholderScreen title={title} programLabel={programLabel} />;
}
