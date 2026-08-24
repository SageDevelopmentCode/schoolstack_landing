import { useLocalSearchParams } from 'expo-router';

import { ParentAccountScreen } from '@/components/parent/parent-account-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentAccountRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return <ParentAccountScreen />;
}
