import { useLocalSearchParams } from 'expo-router';

import { ParentHomeScreen } from '@/components/parent/parent-home-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentHomeRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return <ParentHomeScreen slug={slug} />;
}
