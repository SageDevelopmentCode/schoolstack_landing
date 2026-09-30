import type { Ionicons } from '@expo/vector-icons';
import type { MobileMoreMenuFeatureKey } from '@/lib/parent/mobile-parent-portal-nav';
import type { ParentMoreMenuItemId } from '@/lib/parent/parent-nav';

const MORE_MENU_FEATURE_TO_ITEM_ID: Record<MobileMoreMenuFeatureKey, ParentMoreMenuItemId> = {
  attendance: 'attendance',
  children: 'children',
  committees: 'committees',
  classroom_signups: 'classroom-signups',
  forms_documents: 'forms-documents',
  friday_branch: 'friday-branch',
  notifications: 'notifications',
};

export function parentMoreMenuItemIdForFeatureKey(
  featureKey: MobileMoreMenuFeatureKey,
): ParentMoreMenuItemId {
  return MORE_MENU_FEATURE_TO_ITEM_ID[featureKey];
}

export const PARENT_MORE_MENU_META: Record<
  ParentMoreMenuItemId,
  {
    label: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    iconColor: string;
  }
> = {
  attendance: {
    label: 'Attendance',
    subtitle: 'Child attendance history',
    icon: 'clipboard-outline',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  children: {
    label: 'My children',
    subtitle: 'Profiles and details',
    icon: 'people-outline',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
  },
  committees: {
    label: 'Committees',
    subtitle: 'Volunteer participation',
    icon: 'heart-outline',
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
  },
  'classroom-signups': {
    label: 'Classroom signups',
    subtitle: 'Help teachers with volunteer requests',
    icon: 'clipboard-outline',
    iconBg: '#E9F2EA',
    iconColor: '#3D6B4F',
  },
  'forms-documents': {
    label: 'Forms & documents',
    subtitle: 'View and sign school forms',
    icon: 'document-text-outline',
    iconBg: '#E2E8F0',
    iconColor: '#475569',
  },
  'friday-branch': {
    label: 'Friday Branch',
    subtitle: 'Sign up for Friday classes',
    icon: 'calendar-outline',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
  },
  notifications: {
    label: 'Notification settings',
    subtitle: 'Family email preferences',
    icon: 'notifications-outline',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
  },
};
