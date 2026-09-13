import { useLocalSearchParams } from 'expo-router';

import { ClassroomDetailScreen } from '@/components/school-admin/classrooms/classroom-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminClassroomDetailPage() {
  const { slug, classroomId } = useLocalSearchParams<{ slug: string; classroomId: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug || !classroomId) {
    return null;
  }

  return (
    <ClassroomDetailScreen
      slug={selectedSchool.slug}
      organizationId={selectedSchool.id}
      classroomId={classroomId}
    />
  );
}
