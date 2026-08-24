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
    if (error instanceof Error) {
      throw new StudentProfilePhotoUploadError(error.message, 'upload_failed');
    }
    throw new StudentProfilePhotoUploadError('Failed to upload photo.', 'upload_failed');
  }
}
