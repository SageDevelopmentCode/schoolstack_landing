import { reportMobileOperationalError } from '@/lib/mobile-activity';
import { fetchParentApiFormData } from '@/lib/parent/parent-portal-api';

export class GuardianProfilePhotoUploadError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'GuardianProfilePhotoUploadError';
    this.code = code;
  }
}

type UploadGuardianProfilePhotoParams = {
  organizationId: string;
  uri: string;
  mimeType?: string;
  fileName?: string;
};

export async function uploadGuardianProfilePhotoFromParent(
  params: UploadGuardianProfilePhotoParams,
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
    const payload = await fetchParentApiFormData<{ profilePhotoUrl?: string; error?: string }>(
      '/api/parent-portal/profile-photo',
      formData,
    );

    const profilePhotoUrl = payload.profilePhotoUrl?.trim();
    if (!profilePhotoUrl) {
      throw new GuardianProfilePhotoUploadError(
        'Upload succeeded but no photo URL was returned.',
        'missing_url',
      );
    }

    return profilePhotoUrl;
  } catch (error) {
    if (error instanceof GuardianProfilePhotoUploadError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : 'Failed to upload photo.';
    void reportMobileOperationalError(
      {
        organizationId,
        surface: 'parent_portal',
        operation: 'parent_guardian_profile_photo_upload',
        error: message,
        code: 'upload_failed',
      },
      error,
    );

    throw new GuardianProfilePhotoUploadError(message, 'upload_failed');
  }
}
