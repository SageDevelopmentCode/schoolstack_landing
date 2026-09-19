import { useLocalSearchParams } from 'expo-router';

import { ParentBulletinDetailScreen } from '@/components/parent/bulletin/parent-bulletin-detail-screen';
import { useAuth } from '@/contexts/auth-context';

export default function ParentBulletinDetailRoute() {
  const { slug, postId } = useLocalSearchParams<{ slug: string; postId: string }>();
  const { selectedSchool } = useAuth();

  if (!slug || !postId || !selectedSchool) return null;

  return <ParentBulletinDetailScreen postId={postId} />;
}
