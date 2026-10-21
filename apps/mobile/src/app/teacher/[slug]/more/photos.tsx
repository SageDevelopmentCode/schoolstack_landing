import { useLocalSearchParams } from 'expo-router';

import { TeacherPhotosScreen } from '@/components/teacher/teacher-photos-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherPhotosRoute() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <TeacherPhotosScreen
      organizationId={selectedSchool.id}
      slug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
