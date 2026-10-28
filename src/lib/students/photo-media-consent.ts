export const PHOTO_MEDIA_CONSENT_VALUES = ["full", "limited", "none"] as const;

export type PhotoMediaConsent = (typeof PHOTO_MEDIA_CONSENT_VALUES)[number];

export type PhotoMediaConsentOption = {
  value: PhotoMediaConsent;
  label: string;
  description: string;
};

export const PHOTO_MEDIA_CONSENT_OPTIONS: PhotoMediaConsentOption[] = [
  {
    value: "full",
    label: "Full consent",
    description:
      "The school may use photos and video of your child in all school materials, including the website, social media, newsletters, and print.",
  },
  {
    value: "limited",
    label: "Limited consent",
    description:
      "Photos and video may be shared only with enrolled families (for example newsletters to current families), not for public marketing.",
  },
  {
    value: "none",
    label: "No consent",
    description:
      "Do not photograph or record my child for school use. Please exclude my child from group photos when practicable.",
  },
];

const ENROLLMENT_CONSENT_TO_STORED: Record<string, PhotoMediaConsent> = {
  FULL: "full",
  full_use: "full",
  LIMITED: "limited",
  no_face: "limited",
  NO: "none",
};

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

export function mapEnrollmentConsentToPhotoMediaConsent(
  consentValue: string | null | undefined,
): PhotoMediaConsent | null {
  const trimmed = consentValue?.trim();
  if (!trimmed) return null;
  return ENROLLMENT_CONSENT_TO_STORED[trimmed] ?? null;
}

export function photoMediaConsentLabel(consent: PhotoMediaConsent | null): string {
  if (!consent) return "Not set yet";
  return PHOTO_MEDIA_CONSENT_OPTIONS.find((option) => option.value === consent)?.label ?? consent;
}

export function photoMediaConsentDescription(
  consent: PhotoMediaConsent | null,
): string | null {
  if (!consent) return null;
  return PHOTO_MEDIA_CONSENT_OPTIONS.find((option) => option.value === consent)?.description ?? null;
}
