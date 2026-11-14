import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

/**
 * TEMPORARY: parent Home redesign lab. Three mobile Home variants reachable from
 * the More menu so they can be compared on a device before replacing the real
 * Home tab. Remove this file, the `home-lab` route and `components/parent/home-lab`
 * once a variant is promoted.
 */

export type ParentHomeLabVariantId = 'a' | 'b' | 'c';

export type ParentHomeLabVariant = {
  id: ParentHomeLabVariantId;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

export const PARENT_HOME_LAB_VARIANTS: readonly ParentHomeLabVariant[] = [
  {
    id: 'a',
    label: 'Home A · Today',
    subtitle: 'One scroll, collapsing header, jump chips',
    icon: 'sunny-outline',
    iconBg: '#FFE58A',
    iconColor: '#2B241D',
  },
  {
    id: 'b',
    label: 'Home B · Focus',
    subtitle: 'Guided next step, swipeable sections',
    icon: 'footsteps-outline',
    iconBg: '#DDEBD5',
    iconColor: '#2E4A3C',
  },
  {
    id: 'c',
    label: 'Home C · Hub',
    subtitle: 'Widgets up top, details in sheets',
    icon: 'grid-outline',
    iconBg: '#E3EDFB',
    iconColor: '#24507A',
  },
];

/** Shown in dev builds, or any build made with EXPO_PUBLIC_PARENT_HOME_LAB=1. */
export function isParentHomeLabEnabled(): boolean {
  return __DEV__ || process.env.EXPO_PUBLIC_PARENT_HOME_LAB === '1';
}

export function isParentHomeLabVariantId(value: unknown): value is ParentHomeLabVariantId {
  return value === 'a' || value === 'b' || value === 'c';
}

export function parentHomeLabRoute(slug: string, variant: ParentHomeLabVariantId): Href {
  return `/parent/${slug}/more/home-lab/${variant}` as Href;
}
