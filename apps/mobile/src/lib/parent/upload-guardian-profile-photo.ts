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
    if (error instanceof Error) {
      throw new GuardianProfilePhotoUploadError(error.message, 'upload_failed');
    }
    throw new GuardianProfilePhotoUploadError('Failed to upload photo.', 'upload_failed');
  }
}
