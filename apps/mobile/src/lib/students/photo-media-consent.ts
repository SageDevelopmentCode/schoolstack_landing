export const PHOTO_MEDIA_CONSENT_VALUES = ['full', 'limited', 'none'] as const;

export type PhotoMediaConsent = (typeof PHOTO_MEDIA_CONSENT_VALUES)[number];

export type PhotoMediaConsentOption = {
  value: PhotoMediaConsent;
  label: string;
  description: string;
};

export const PHOTO_MEDIA_CONSENT_OPTIONS: PhotoMediaConsentOption[] = [
  {
    value: 'full',
    label: 'Full consent',
    description:
      'The school may use photos and video of your child in all school materials, including the website, social media, newsletters, and print.',
  },
  {
    value: 'limited',
    label: 'Limited consent',
    description:
      'Photos and video may be shared only with enrolled families (for example newsletters to current families), not for public marketing.',
  },
  {
    value: 'none',
    label: 'No consent',
    description:
      'Do not photograph or record my child for school use. Please exclude my child from group photos when practicable.',
  },
];

export function isPhotoMediaConsent(value: string): value is PhotoMediaConsent {
  return (PHOTO_MEDIA_CONSENT_VALUES as readonly string[]).includes(value);
}

export function parsePhotoMediaConsent(
  value: string | null | undefined,
): PhotoMediaConsent | null {
  const trimmed = value?.trim();
  if (!trimmed || !isPhotoMediaConsent(trimmed)) return null;
  return trimmed;
}

export function photoMediaConsentLabel(consent: PhotoMediaConsent | null): string {
  if (!consent) return 'Not set yet';
  return PHOTO_MEDIA_CONSENT_OPTIONS.find((option) => option.value === consent)?.label ?? consent;
}

export function childFirstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/).filter(Boolean)[0];
  return part ?? fullName;
}

export type PhotoMediaConsentChipTone = 'success' | 'warning' | 'alert' | 'info';

export type PhotoMediaConsentIoniconName =
  | 'checkmark-circle'
  | 'eye-outline'
  | 'close-circle'
  | 'camera-outline';

export function photoMediaConsentChipTone(
  consent: PhotoMediaConsent | null,
): PhotoMediaConsentChipTone {
  if (consent === 'full') return 'success';
  if (consent === 'limited') return 'warning';
  if (consent === 'none') return 'alert';
  return 'info';
}

export function photoMediaConsentIconName(
  consent: PhotoMediaConsent | null,
): PhotoMediaConsentIoniconName {
  if (consent === 'full') return 'checkmark-circle';
  if (consent === 'limited') return 'eye-outline';
  if (consent === 'none') return 'close-circle';
  return 'camera-outline';
}
