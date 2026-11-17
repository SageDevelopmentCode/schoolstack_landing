import { useLocalSearchParams } from 'expo-router';

import { TeacherPhotosGardenScreen } from '@/components/teacher/photos/garden/teacher-photos-garden-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherPhotosRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return <TeacherPhotosGardenScreen organizationId={selectedSchool.id} slug={selectedSchool.slug} />;
}
