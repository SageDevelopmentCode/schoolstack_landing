import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { fetchSchoolAdminApiFormData } from '@/lib/school-admin-api';
import { StaffProfilePhotoUploadError } from '@/lib/teacher/upload-staff-profile-photo';

type UploadSchoolAdminProfilePhotoParams = {
  organizationId: string;
  uri: string;
  mimeType?: string;
  fileName?: string;
};

export async function uploadStaffProfilePhotoFromSchoolAdmin(
  params: UploadSchoolAdminProfilePhotoParams,
): Promise<string> {
  const { organizationId, uri, mimeType = 'image/jpeg', fileName = 'profile-photo.jpg' } = params;

  const formData = new FormData();
  formData.append('organizationId', organizationId);
  formData.append(
    'file',
    {
      uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob,
  );

  try {
    const payload = await fetchSchoolAdminApiFormData<{ profilePhotoUrl?: string; error?: string }>(
      '/api/school-admin/profile-photo',
      formData,
    );

    const profilePhotoUrl = payload.profilePhotoUrl?.trim();
    if (!profilePhotoUrl) {
      throw new StaffProfilePhotoUploadError(
        'Upload succeeded but no photo URL was returned.',
        'missing_url',
      );
    }

    return profilePhotoUrl;
  } catch (error) {
    if (error instanceof StaffProfilePhotoUploadError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Failed to upload photo.';
    void reportMobileOperationalError(
      {
        organizationId,
        surface: 'school_admin',
        operation: 'school_admin_staff_profile_photo_upload',
        error: message,
        code: 'upload_failed',
      },
      error,
    );

    throw new StaffProfilePhotoUploadError(message, 'upload_failed');
  }
}
