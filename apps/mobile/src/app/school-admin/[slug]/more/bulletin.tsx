import { useLocalSearchParams } from 'expo-router';

import { BulletinScreen } from '@/components/school-admin/bulletin/bulletin-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminBulletinPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <BulletinScreen
      organizationId={selectedSchool.id}
      slug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
