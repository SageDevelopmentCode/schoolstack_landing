import { useLocalSearchParams } from 'expo-router';

import { PhotosScreen } from '@/components/school-admin/gallery/photos-screen';
import { useAuth } from '@/contexts/auth-context';

export default function SchoolAdminPhotosPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { selectedSchool } = useAuth();

  if (!selectedSchool || selectedSchool.slug !== slug) {
    return null;
  }

  return (
    <PhotosScreen
      organizationId={selectedSchool.id}
      slug={selectedSchool.slug}
      schoolName={selectedSchool.name}
    />
  );
}
