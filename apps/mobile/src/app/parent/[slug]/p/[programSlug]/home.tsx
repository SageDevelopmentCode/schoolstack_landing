import { useLocalSearchParams } from 'expo-router';

import { ParentProgramHomeScreen } from '@/components/parent/parent-program-home-screen';

export default function ProgramParentHomeRoute() {
  const { slug, programSlug } = useLocalSearchParams<{ slug: string; programSlug: string }>();

  if (!slug || !programSlug) {
    return null;
  }

  return <ParentProgramHomeScreen slug={slug} programSlug={programSlug} />;
}
