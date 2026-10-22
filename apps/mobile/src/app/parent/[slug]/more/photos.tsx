import { useLocalSearchParams } from 'expo-router';

import { ParentPhotosScreen } from '@/components/parent/parent-photos-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentPhotosRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool) return null;

  return (
    <ParentPhotosScreen organizationId={selectedSchool.id} slug={slug} />
  );
}
