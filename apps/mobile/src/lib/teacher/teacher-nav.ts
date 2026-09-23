import type { Href } from 'expo-router';

export type TeacherTab = 'home' | 'my-students' | 'messages' | 'calendar' | 'more';

export type TeacherMoreMenuItemId =
  | 'classroom-signups'
  | 'my-hours'
  | 'attendance'
  | 'committees';

export function teacherTabRoute(slug: string, tab: Exclude<TeacherTab, 'more'>): Href {
  return `/teacher/${slug}/${tab}` as Href;
}

export function teacherMoreRoute(slug: string, item: TeacherMoreMenuItemId): Href {
  return `/teacher/${slug}/more/${item}` as Href;
}

export function teacherAccountRoute(slug: string): Href {
  return `/teacher/${slug}/more/account` as Href;
}

export type TeacherStudentDetailScope = 'assigned' | 'school';

export function teacherStudentDetailRoute(
  slug: string,
  studentId: string,
  options?: { scope?: TeacherStudentDetailScope },
): Href {
  const base = `/teacher/${slug}/students/${encodeURIComponent(studentId)}`;
  if (options?.scope === 'school') {
    return `${base}?scope=school` as Href;
  }
  return base as Href;
}

export function isTeacherStudentDetailPath(pathname: string): boolean {
  return /\/students\/[^/]+$/.test(pathname);
}

export function teacherBulletinDetailRoute(slug: string, postId: string): Href {
  return `/teacher/${slug}/bulletin/${encodeURIComponent(postId)}` as Href;
}

export function isTeacherBulletinDetailPath(pathname: string): boolean {
  return /\/bulletin\/[^/]+$/.test(pathname);
}

export function isTeacherMessageThreadPath(pathname: string): boolean {
  return /\/teacher\/[^/]+\/messages\/[^/]+$/.test(pathname);
}

export function teacherMessageThreadRoute(slug: string, threadId: string): Href {
  return `/teacher/${slug}/messages/${encodeURIComponent(threadId)}` as Href;
}

export function teacherNewMessageThreadRoute(slug: string, contactKey: string): Href {
  const query = new URLSearchParams({ contactKey }).toString();
  return `/teacher/${slug}/messages/new?${query}` as Href;
}

const FEATURE_ROUTE_MAP: Record<string, (slug: string) => Href> = {
  dashboard: (slug) => teacherTabRoute(slug, 'home'),
  home: (slug) => teacherTabRoute(slug, 'home'),
  my_students: (slug) => teacherTabRoute(slug, 'my-students'),
  messages: (slug) => teacherTabRoute(slug, 'messages'),
  calendar: (slug) => teacherTabRoute(slug, 'calendar'),
  classroom_signups: (slug) => teacherMoreRoute(slug, 'classroom-signups'),
  my_hours: (slug) => teacherMoreRoute(slug, 'my-hours'),
  attendance: (slug) => teacherMoreRoute(slug, 'attendance'),
  committees: (slug) => teacherMoreRoute(slug, 'committees'),
};

export function getTeacherFeatureRoute(slug: string, featureKey: string): Href | null {
  const resolver = FEATURE_ROUTE_MAP[featureKey];
  return resolver ? resolver(slug) : null;
}

export function resolveTeacherFocusHref(slug: string, webHref: string): Href | null {
  const trimmed = webHref.trim();
  if (!trimmed) return null;

  const teacherMatch = trimmed.match(/\/school\/[^/]+\/teacher\/([^/?#]+)/);
  if (teacherMatch?.[1]) {
    const featureKey = teacherMatch[1].replace(/-/g, '_');
    return getTeacherFeatureRoute(slug, featureKey);
  }

  if (trimmed.startsWith('/teacher/')) {
    return trimmed as Href;
  }

  return null;
}
