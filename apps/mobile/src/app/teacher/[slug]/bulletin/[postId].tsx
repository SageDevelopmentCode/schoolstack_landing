import { useLocalSearchParams } from 'expo-router';

import { TeacherBulletinDetailScreen } from '@/components/teacher/bulletin/teacher-bulletin-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function TeacherBulletinDetailRoute() {
  const { slug, postId } = useLocalSearchParams<{ slug: string; postId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !postId || !selectedSchool) return null;

  return <TeacherBulletinDetailScreen postId={postId} />;
}
