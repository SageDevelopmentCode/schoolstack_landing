import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

export type ParentTab = 'home' | 'billing' | 'messages' | 'calendar' | 'more';

export type ParentMoreMenuItemId =
  | 'attendance'
  | 'children'
  | 'committees'
  | 'applications'
  | 'notifications';

export function parentTabRoute(slug: string, tab: Exclude<ParentTab, 'more'>): Href {
  return `/parent/${slug}/${tab}` as Href;
}

export function parentCalendarEventRoute(slug: string, eventId: string): Href {
  return `/parent/${slug}/calendar?eventId=${encodeURIComponent(eventId)}` as Href;
}

export function parentMoreRoute(slug: string, item: ParentMoreMenuItemId): Href {
  return `/parent/${slug}/more/${item}` as Href;
}

export function parentChildrenRoute(slug: string, applicationId?: string): Href {
  if (applicationId) {
    return parentChildDetailRoute(slug, applicationId);
  }
  return parentMoreRoute(slug, 'children');
}

export function parentChildDetailRoute(slug: string, applicationId: string): Href {
  return `/parent/${slug}/more/children/${encodeURIComponent(applicationId)}` as Href;
}

export function isParentChildDetailPath(pathname: string): boolean {
  return /\/more\/children\/[^/]+$/.test(pathname);
}

const FEATURE_ROUTE_MAP: Record<string, (slug: string) => Href> = {
  portal: (slug) => parentTabRoute(slug, 'home'),
  home: (slug) => parentTabRoute(slug, 'home'),
  billing: (slug) => parentTabRoute(slug, 'billing'),
  messages: (slug) => parentTabRoute(slug, 'messages'),
  calendar: (slug) => parentTabRoute(slug, 'calendar'),
  attendance: (slug) => parentMoreRoute(slug, 'attendance'),
  children: (slug) => parentMoreRoute(slug, 'children'),
  committees: (slug) => parentMoreRoute(slug, 'committees'),
  notifications: (slug) => parentMoreRoute(slug, 'notifications'),
};

export function getParentFeatureRoute(slug: string, featureKey: string): Href | null {
  const resolver = FEATURE_ROUTE_MAP[featureKey];
  return resolver ? resolver(slug) : null;
}

export function getOnboardingItemRoute(slug: string, target: string): Href | null {
  if (target.startsWith('url:')) return null;
  return getParentFeatureRoute(slug, target);
}

type QuickActionIconStyle = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
};

const QUICK_ACTION_ICON_STYLES: Record<string, QuickActionIconStyle> = {
  home: { icon: 'home-outline', iconBg: '#E0E7FF', iconColor: '#4F46E5' },
  'credit-card': { icon: 'card-outline', iconBg: '#D1FAE5', iconColor: '#059669' },
  'dollar-sign': { icon: 'cash-outline', iconBg: '#D1FAE5', iconColor: '#059669' },
  'message-square': { icon: 'chatbubble-outline', iconBg: '#DBEAFE', iconColor: '#2563EB' },
  'calendar-days': { icon: 'calendar-outline', iconBg: '#EDE9FE', iconColor: '#7C3AED' },
  'clipboard-list': { icon: 'clipboard-outline', iconBg: '#FEF3C7', iconColor: '#D97706' },
  megaphone: { icon: 'megaphone-outline', iconBg: '#E0F2FE', iconColor: '#0284C7' },
  users: { icon: 'people-outline', iconBg: '#FFE4E6', iconColor: '#E11D48' },
  heart: { icon: 'heart-outline', iconBg: '#FCE7F3', iconColor: '#DB2777' },
  puzzle: { icon: 'extension-puzzle-outline', iconBg: '#F3F4F6', iconColor: '#6B7280' },
};

const DEFAULT_QUICK_ACTION_ICON: QuickActionIconStyle = {
  icon: 'ellipse-outline',
  iconBg: '#F3F4F6',
  iconColor: '#6B7280',
};

export function getQuickActionIconStyle(iconSlug: string): QuickActionIconStyle {
  return QUICK_ACTION_ICON_STYLES[iconSlug] ?? DEFAULT_QUICK_ACTION_ICON;
}
