import type { Ionicons } from '@expo/vector-icons';

import type { AccountPortalId } from '@/lib/auth/school-portal-options-types';

export type AccountPortalMoreMenuMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  subtitle: string;
};

export const ACCOUNT_PORTAL_MORE_MENU_META: Record<AccountPortalId, AccountPortalMoreMenuMeta> = {
  admin: {
    icon: 'business-outline',
    iconBg: '#E0E7FF',
    iconColor: '#4338CA',
    subtitle: 'School administration',
  },
  teacher: {
    icon: 'briefcase-outline',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
    subtitle: 'Classroom tools and account',
  },
  family_apply: {
    icon: 'clipboard-outline',
    iconBg: '#E9F2EA',
    iconColor: '#3D6B4F',
    subtitle: 'Application status and forms',
  },
  family_parent: {
    icon: 'people-outline',
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
    subtitle: 'Children and family account',
  },
};
