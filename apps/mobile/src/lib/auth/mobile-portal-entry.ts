import type { Href } from 'expo-router';

import type { PortalType } from '@/lib/auth/resolve-portal';
import { parentTabRoute } from '@/lib/parent/parent-nav';
import { teacherTabRoute } from '@/lib/teacher/teacher-nav';

export function getMobileEntryRoute(portalType: PortalType, slug: string): Href {
  switch (portalType) {
    case 'school_admin':
      return `/school-admin/${slug}/dashboard` as Href;
    case 'teacher':
      return teacherTabRoute(slug, 'home');
    case 'parent':
      return parentTabRoute(slug, 'home');
    case 'parent_apply':
      return '/parent-apply-gate' as Href;
    case 'platform_admin':
      return '/platform-admin/organizations' as Href;
    default:
      return '/portal' as Href;
  }
}
