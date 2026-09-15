import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { fetchParentApiFormData } from '@/lib/parent/parent-portal-api';

export class StudentProfilePhotoUploadError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'StudentProfilePhotoUploadError';
    this.code = code;
  }
}

type UploadStudentProfilePhotoParams = {
  organizationId: string;
  studentId: string;
  uri: string;
  mimeType?: string;
  fileName?: string;
};

export async function uploadStudentProfilePhotoFromParent(
  params: UploadStudentProfilePhotoParams,
): Promise<string> {
  const { organizationId, studentId, uri, mimeType = 'image/jpeg', fileName = 'profile-photo.jpg' } =
    params;

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
    const payload = await fetchParentApiFormData<{ profilePhotoUrl?: string; error?: string }>(
      `/api/parent-portal/students/${encodeURIComponent(studentId)}/profile-photo`,
      formData,
    );

    const profilePhotoUrl = payload.profilePhotoUrl?.trim();
    if (!profilePhotoUrl) {
      throw new StudentProfilePhotoUploadError(
        'Upload succeeded but no photo URL was returned.',
        'missing_url',
      );
    }

    return profilePhotoUrl;
  } catch (error) {
    if (error instanceof StudentProfilePhotoUploadError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : 'Failed to upload photo.';
    void reportMobileOperationalError(
      {
        organizationId,
        surface: 'parent_portal',
        operation: 'parent_student_profile_photo_upload',
        error: message,
        code: 'upload_failed',
        entityType: 'student',
        entityId: studentId,
      },
      error,
    );

    throw new StudentProfilePhotoUploadError(message, 'upload_failed');
  }
}
