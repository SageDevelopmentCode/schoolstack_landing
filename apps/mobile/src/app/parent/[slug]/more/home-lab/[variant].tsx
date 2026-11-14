import { Redirect, useLocalSearchParams, type Href } from 'expo-router';

import { ParentHomeLabScreen } from '@/components/parent/home-lab/parent-home-lab-screen';
import { useAuth } from '@/contexts/auth-context';
import { isParentHomeLabEnabled, isParentHomeLabVariantId } from '@/lib/parent/home-lab';

/** TEMPORARY Home redesign lab route (see `lib/parent/home-lab.ts`). */
export default function ParentHomeLabRoute() {
  const { slug, variant } = useLocalSearchParams<{ slug: string; variant: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  if (!isParentHomeLabEnabled() || !isParentHomeLabVariantId(variant)) {
    return <Redirect href={`/parent/${slug}/home` as Href} />;
  }

  return <ParentHomeLabScreen slug={slug} variant={variant} />;
}
