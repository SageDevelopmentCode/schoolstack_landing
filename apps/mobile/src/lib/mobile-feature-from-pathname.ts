import type { MobileParentTabDefinition } from '@/lib/parent/mobile-parent-portal-nav';
import {
  getParentActiveTabFromPathname,
  isParentBulletinDetailPath,
  isParentChildDetailPath,
  isParentProgramPortalPath,
} from '@/lib/parent/parent-nav';
import {
  isTeacherBulletinDetailPath,
  isTeacherStudentDetailPath,
} from '@/lib/teacher/teacher-nav';

export type MobileFeatureVisitSurface = 'parent_portal' | 'teacher_portal' | 'school_admin';

function normalizeSegment(segment: string): string {
  return segment.trim().replace(/-/g, '_');
}

function extractProgramSlug(pathname: string): string | undefined {
  const match = pathname.match(/\/parent\/[^/]+\/p\/([^/]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

export function resolveParentMobileFeatureKey(
  pathname: string,
  tabs: Pick<MobileParentTabDefinition, 'tabId' | 'pathSegment'>[],
): string | null {
  if (isParentChildDetailPath(pathname)) return null;
  if (isParentBulletinDetailPath(pathname)) return null;
  if (/\/messages\/[^/]+$/.test(pathname)) return null;

  const moreMatch = pathname.match(/\/more\/([^/?]+)/);
  if (moreMatch?.[1]) {
    return normalizeSegment(moreMatch[1]);
  }

  const tab = getParentActiveTabFromPathname(pathname, tabs);
  if (tab && tab !== 'more') {
    return tab === 'home' ? 'home' : tab;
  }

  const programSegmentMatch = pathname.match(/\/parent\/[^/]+\/p\/[^/]+\/([^/?]+)/);
  const mainSegmentMatch = pathname.match(/\/parent\/[^/]+\/([^/?]+)/);
  const segment = programSegmentMatch?.[1] ?? mainSegmentMatch?.[1];
  if (!segment || segment === 'p' || segment === 'bulletin') {
    return null;
  }

  return normalizeSegment(segment);
}

export function resolveParentProgramSlugFromPathname(pathname: string): string | undefined {
  if (!isParentProgramPortalPath(pathname)) {
    return undefined;
  }
  return extractProgramSlug(pathname);
}

export function resolveTeacherMobileFeatureKey(pathname: string): string | null {
  if (isTeacherStudentDetailPath(pathname)) return null;
  if (isTeacherBulletinDetailPath(pathname)) return null;
  if (/\/messages\/[^/]+$/.test(pathname)) return null;

  const moreMatch = pathname.match(/\/more\/([^/?]+)/);
  if (moreMatch?.[1]) {
    const segment = moreMatch[1];
    if (segment === 'committees' && /\/committees\/[^/]+/.test(pathname)) {
      return null;
    }
    return normalizeSegment(segment);
  }

  if (pathname.includes('/my-students')) return 'my_students';
  if (pathname.includes('/messages')) return 'messages';
  if (pathname.includes('/calendar')) return 'calendar';
  if (pathname.includes('/home')) return 'home';
  return null;
}

export function resolveSchoolAdminMobileFeatureKey(pathname: string): string | null {
  if (/\/submissions\/[^/]+$/.test(pathname)) return null;
  if (/\/students\/[^/]+$/.test(pathname)) return null;
  if (/\/messages\/[^/]+$/.test(pathname)) return null;
  if (/\/more\/staff\/[^/]+$/.test(pathname)) return null;
  if (/\/more\/classrooms\/[^/]+$/.test(pathname)) return null;
  if (/\/more\/committees\/[^/]+$/.test(pathname)) return null;

  const moreMatch = pathname.match(/\/more\/([^/?]+)/);
  if (moreMatch?.[1]) {
    return normalizeSegment(moreMatch[1]);
  }

  if (pathname.includes('/admissions/submissions')) return 'admissions';
  if (pathname.includes('/students')) return 'students';
  if (pathname.includes('/messages')) return 'messages';
  if (pathname.includes('/dashboard')) return 'dashboard';
  return null;
}

export function resolveMobileFeatureKeyFromPathname(
  surface: MobileFeatureVisitSurface,
  pathname: string,
  parentTabs?: Pick<MobileParentTabDefinition, 'tabId' | 'pathSegment'>[],
): string | null {
  if (surface === 'parent_portal') {
    return resolveParentMobileFeatureKey(pathname, parentTabs ?? []);
  }
  if (surface === 'teacher_portal') {
    return resolveTeacherMobileFeatureKey(pathname);
  }
  return resolveSchoolAdminMobileFeatureKey(pathname);
}
