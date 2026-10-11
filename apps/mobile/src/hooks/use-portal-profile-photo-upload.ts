import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import type { PortalType } from '@/lib/auth/resolve-portal';
import {
  GuardianProfilePhotoUploadError,
  uploadGuardianProfilePhotoFromParent,
} from '@/lib/parent/upload-guardian-profile-photo';
import { uploadStaffProfilePhotoFromSchoolAdmin } from '@/lib/school-admin/upload-staff-profile-photo';
import {
  StaffProfilePhotoUploadError,
  uploadStaffProfilePhotoFromTeacher,
} from '@/lib/teacher/upload-staff-profile-photo';

type UsePortalProfilePhotoUploadArgs = {
  organizationId: string | null | undefined;
  initialPhotoUrl?: string | null;
  portalType: PortalType | null;
  onSuccess?: (profilePhotoUrl: string) => void;
};

function canUploadProfilePhoto(portalType: PortalType | null): boolean {
  return (
    portalType === 'parent' ||
    portalType === 'parent_apply' ||
    portalType === 'teacher' ||
    portalType === 'school_admin'
  );
}

export function usePortalProfilePhotoUpload({
  organizationId,
  initialPhotoUrl,
  portalType,
  onSuccess,
}: UsePortalProfilePhotoUploadArgs) {
  const { isPlatformAdminSession, previewSession } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl ?? null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setPhotoUrl(initialPhotoUrl ?? null);
  }, [initialPhotoUrl]);

  const editable =
    Boolean(organizationId) &&
    canUploadProfilePhoto(portalType) &&
    !isPlatformAdminSession &&
    !previewSession;

  const handlePhotoSelected = useCallback(
    async (uri: string, mimeType?: string) => {
      if (!editable || !organizationId || !portalType || uploading) {
        return;
      }

      setUploading(true);
      try {
        let nextUrl: string;
        switch (portalType) {
          case 'parent':
          case 'parent_apply':
            nextUrl = await uploadGuardianProfilePhotoFromParent({
              organizationId,
              uri,
              mimeType,
            });
            break;
          case 'teacher':
            nextUrl = await uploadStaffProfilePhotoFromTeacher({
              organizationId,
              uri,
              mimeType,
            });
            break;
          case 'school_admin':
            nextUrl = await uploadStaffProfilePhotoFromSchoolAdmin({
              organizationId,
              uri,
              mimeType,
            });
            break;
          default:
            return;
        }

        setPhotoUrl(nextUrl);
        onSuccess?.(nextUrl);
      } catch (error) {
        const message =
          error instanceof GuardianProfilePhotoUploadError ||
          error instanceof StaffProfilePhotoUploadError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to upload photo.';
        Alert.alert('Photo upload failed', message);
      } finally {
        setUploading(false);
      }
    },
    [editable, organizationId, onSuccess, portalType, uploading],
  );

  return {
    photoUrl,
    uploading,
    editable,
    handlePhotoSelected,
  };
}
