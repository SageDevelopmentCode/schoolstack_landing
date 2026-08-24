import { useLocalSearchParams } from 'expo-router';

import { ParentChildrenScreen } from '@/components/parent/children/parent-children-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentChildrenRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <ParentChildrenScreen slug={slug} />;
}
