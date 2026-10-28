import { fetchSchoolAdminApi } from '@/lib/school-admin-api';
import type { PhotoMediaConsent } from '@/lib/students/photo-media-consent';

export type SchoolAdminPhotoMediaConsentRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  familyName: string | null;
  programLabel: string;
  consent: PhotoMediaConsent | null;
  consentLabel: string;
  updatedAt: string | null;
};

export async function fetchSchoolAdminPhotoMediaConsents(
  organizationId: string,
): Promise<SchoolAdminPhotoMediaConsentRow[]> {
  const params = new URLSearchParams({ organizationId });
  const payload = await fetchSchoolAdminApi<{ students?: SchoolAdminPhotoMediaConsentRow[] }>(
    `/api/school-admin/photo-media-consents?${params.toString()}`,
  );
  return payload.students ?? [];
}
