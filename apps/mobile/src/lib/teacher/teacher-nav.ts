import type { Href } from 'expo-router';

export type TeacherTab = 'home' | 'my-students' | 'messages' | 'calendar' | 'more';

export type TeacherMoreMenuItemId = 'classroom-signups' | 'my-hours' | 'attendance';

export function teacherTabRoute(slug: string, tab: Exclude<TeacherTab, 'more'>): Href {
  return `/teacher/${slug}/${tab}` as Href;
}

export function teacherMoreRoute(slug: string, item: TeacherMoreMenuItemId): Href {
  return `/teacher/${slug}/more/${item}` as Href;
}

export function teacherAccountRoute(slug: string): Href {
  return `/teacher/${slug}/more/account` as Href;
}
