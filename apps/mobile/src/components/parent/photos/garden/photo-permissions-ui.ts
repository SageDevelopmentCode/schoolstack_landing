import type { Ionicons } from '@expo/vector-icons';

import { Garden, type GChipTone } from '@/components/parent/garden/tokens';
import type { PhotoMediaConsent } from '@/lib/students/photo-media-consent';

type IoniconName = keyof typeof Ionicons.glyphMap;

/** Mirrors web `photo-permissions-ui.ts`. */
export function consentChipTone(consent: PhotoMediaConsent | null): GChipTone {
  if (consent === 'full') return 'success';
  if (consent === 'limited') return 'warning';
  if (consent === 'none') return 'alert';
  return 'info';
}

/** One icon per consent level (option cards, chips and the summary rows). */
export const CONSENT_ICONS: Record<PhotoMediaConsent, IoniconName> = {
  full: 'shield-checkmark',
  limited: 'people',
  none: 'eye-off',
};

/** Pastel behind each level's icon. */
export const CONSENT_TINTS: Record<PhotoMediaConsent, string> = {
  full: Garden.mint,
  limited: Garden.butter,
  none: Garden.peach,
};

export function consentIcon(consent: PhotoMediaConsent | null): IoniconName {
  return consent ? CONSENT_ICONS[consent] : 'help-circle-outline';
}

/** "Maya", "Maya and Leo", "Maya, Leo and Ava". */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** "Updated Nov 14, 2026" from an ISO timestamp, or null. */
export function formatConsentUpdated(updatedAt: string | null | undefined): string | null {
  if (!updatedAt) return null;
  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return `Updated ${parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

/** "1 photo" / "12 photos" (with "+" while more pages exist). */
export function photoCountLabel(count: number, hasMore = false): string {
  return `${count}${hasMore ? '+' : ''} ${count === 1 && !hasMore ? 'photo' : 'photos'}`;
}
