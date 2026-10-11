import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { fetchTeacherApiFormData } from '@/lib/teacher/teacher-portal-api';

export class StaffProfilePhotoUploadError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'StaffProfilePhotoUploadError';
    this.code = code;
  }
}

type UploadStaffProfilePhotoParams = {
  organizationId: string;
  uri: string;
  mimeType?: string;
  fileName?: string;
};

export async function uploadStaffProfilePhotoFromTeacher(
  params: UploadStaffProfilePhotoParams,
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
    const payload = await fetchTeacherApiFormData<{ profilePhotoUrl?: string; error?: string }>(
      '/api/teacher-portal/profile-photo',
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
        surface: 'teacher_portal',
        operation: 'teacher_staff_profile_photo_upload',
        error: message,
        code: 'upload_failed',
      },
      error,
    );

    throw new StaffProfilePhotoUploadError(message, 'upload_failed');
  }
}
