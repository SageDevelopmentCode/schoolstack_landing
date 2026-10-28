import { fetchParentApi } from '@/lib/parent/parent-portal-api';
import type { PhotoMediaConsent } from '@/lib/students/photo-media-consent';

export type ParentPhotoMediaConsentLearner = {
  studentId: string;
  studentName: string;
  consent: PhotoMediaConsent | null;
  consentLabel: string;
  updatedAt: string | null;
};

export async function fetchParentPhotoMediaConsents(
  organizationId: string,
  slug: string,
  programId?: string,
): Promise<ParentPhotoMediaConsentLearner[]> {
  const params = new URLSearchParams({
    organizationId,
    slug,
  });
  if (programId?.trim()) {
    params.set('programId', programId.trim());
  }
  const payload = await fetchParentApi<{ learners?: ParentPhotoMediaConsentLearner[] }>(
    `/api/parent-portal/photo-media-consents?${params.toString()}`,
  );
  return payload.learners ?? [];
}

export async function patchParentPhotoMediaConsent(
  organizationId: string,
  studentId: string,
  consent: PhotoMediaConsent,
): Promise<{ consent: PhotoMediaConsent; updatedAt: string }> {
  const payload = await fetchParentApi<{
    consent?: PhotoMediaConsent;
    updatedAt?: string;
  }>(`/api/parent-portal/students/${encodeURIComponent(studentId)}/photo-media-consent`, {
    method: 'PATCH',
    body: JSON.stringify({ organizationId, consent }),
  });
  if (!payload.consent) {
    throw new Error('Could not save photo permissions.');
  }
  return {
    consent: payload.consent,
    updatedAt: payload.updatedAt ?? new Date().toISOString(),
  };
}
