import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

import type { ParentChildRecordSection } from '@/lib/parent/parent-children-utils';
import type { MobileParentTabDefinition, MobileParentTabId } from '@/lib/parent/mobile-parent-portal-nav';
import { parentFeatureKeyToMobilePathSegment } from '@/lib/parent/mobile-parent-portal-nav';

export type ParentTab = MobileParentTabId;

export function parentProgramBasePath(slug: string, programSlug: string): string {
  return `/parent/${slug}/p/${encodeURIComponent(programSlug)}`;
}

export function parentProgramTabRoute(
  slug: string,
  programSlug: string,
  pathSegment: string,
): Href {
  return `${parentProgramBasePath(slug, programSlug)}/${pathSegment}` as Href;
}

export function parentProgramMoreRoute(
  slug: string,
  programSlug: string,
  item: ParentMoreMenuItemId,
): Href {
  return `${parentProgramBasePath(slug, programSlug)}/more/${item}` as Href;
}

export function parentProgramAccountRoute(slug: string, programSlug: string): Href {
  return `${parentProgramBasePath(slug, programSlug)}/more/account` as Href;
}

export function isParentProgramPortalPath(pathname: string): boolean {
  return /\/parent\/[^/]+\/p\/[^/]+/.test(pathname);
}

export function getParentActiveTabFromPathname(
  pathname: string,
  tabs: Pick<MobileParentTabDefinition, 'tabId' | 'pathSegment'>[],
): ParentTab | null {
  if (isParentChildDetailPath(pathname)) return null;
  if (isParentBulletinDetailPath(pathname)) return null;
  if (pathname.includes('/more')) return 'more';
  if (/\/messages\/[^/]+$/.test(pathname)) return null;

  const programSegmentMatch = pathname.match(/\/parent\/[^/]+\/p\/[^/]+\/([^/?]+)/);
  const mainSegmentMatch = pathname.match(/\/parent\/[^/]+\/([^/?]+)/);
  const segment = programSegmentMatch?.[1] ?? mainSegmentMatch?.[1];
  if (!segment || segment === 'p' || segment === 'bulletin') {
    return null;
  }

  const tab = tabs.find((entry) => entry.pathSegment === segment);
  return tab?.tabId ?? null;
}

export type ParentMoreMenuItemId =
  | 'attendance'
  | 'children'
  | 'committees'
  | 'classroom-signups'
  | 'forms-documents'
  | 'friday-branch'
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

export function parentAccountRoute(slug: string): Href {
  return `/parent/${slug}/more/account` as Href;
}

export function parentClassroomSignupsRoute(slug: string): Href {
  return parentMoreRoute(slug, 'classroom-signups');
}

export function parentClassroomSignupDetailRoute(slug: string, signupId: string): Href {
  return `/parent/${slug}/more/classroom-signups/${encodeURIComponent(signupId)}` as Href;
}

export function parentFormsDocumentsRoute(slug: string): Href {
  return parentMoreRoute(slug, 'forms-documents');
}

export function parentFridayBranchRoute(slug: string): Href {
  return parentMoreRoute(slug, 'friday-branch');
}

export function parentFormDetailRoute(slug: string, formId: string): Href {
  return `/parent/${slug}/more/forms-documents/${encodeURIComponent(formId)}` as Href;
}

export function parentBillingAgreementsRoute(
  slug: string,
  formId?: string | null,
): Href {
  const params = new URLSearchParams({ tab: 'agreements' });
  if (formId) {
    params.set('form', formId);
  }
  return `/parent/${slug}/billing?${params.toString()}` as Href;
}

export function parentEnrollmentItemRoute(
  slug: string,
  applicationId: string,
  templateItemId?: string,
  sectionId?: string,
): Href {
  const params = new URLSearchParams({ section: 'checklist' });
  if (templateItemId) {
    params.set('item', templateItemId);
  }
  if (sectionId) {
    params.set('enrollmentSection', sectionId);
  }
  return `/parent/${slug}/more/children/${encodeURIComponent(applicationId)}?${params.toString()}` as Href;
}

export function parseEnrollmentHref(
  enrollmentHref: string,
): { applicationId: string; templateItemId?: string; sectionId?: string } | null {
  const match = enrollmentHref.match(/\/apply\/([^/?]+)\/enrollment(?:\?(.+))?/);
  if (!match) return null;

  const applicationId = match[1];
  const query = match[2];
  if (!query) {
    return { applicationId };
  }

  const params = new URLSearchParams(query);
  return {
    applicationId,
    templateItemId: params.get('item') ?? undefined,
    sectionId: params.get('section') ?? undefined,
  };
}

export function parentChildrenRoute(slug: string, applicationId?: string): Href {
  if (applicationId) {
    const params = new URLSearchParams({ applicationId });
    return `/parent/${slug}/more/children?${params.toString()}` as Href;
  }
  return parentMoreRoute(slug, 'children');
}

export function parentChildDetailRoute(
  slug: string,
  applicationId: string,
  section?: ParentChildRecordSection,
): Href {
  const base = `/parent/${slug}/more/children/${encodeURIComponent(applicationId)}`;
  if (section) {
    return `${base}?section=${section}` as Href;
  }
  return base as Href;
}

export function isParentChildDetailPath(pathname: string): boolean {
  return /\/more\/children\/[^/]+$/.test(pathname);
}

export function parentBulletinDetailRoute(slug: string, postId: string): Href {
  return `/parent/${slug}/bulletin/${encodeURIComponent(postId)}` as Href;
}

export function parentMessageThreadRoute(slug: string, threadId: string): Href {
  return `/parent/${slug}/messages/${encodeURIComponent(threadId)}` as Href;
}

export function parentProgramMessageThreadRoute(
  slug: string,
  programSlug: string,
  threadId: string,
): Href {
  return `${parentProgramBasePath(slug, programSlug)}/messages/${encodeURIComponent(threadId)}` as Href;
}

export function isParentBulletinDetailPath(pathname: string): boolean {
  return /\/bulletin\/[^/]+$/.test(pathname);
}

const WEB_PARENT_FEATURE_ALIASES: Record<string, string> = {
  forms_documents: 'forms_documents',
  'forms-documents': 'forms_documents',
  classroom_signups: 'classroom_signups',
  'classroom-signups': 'classroom_signups',
  friday_branch: 'friday_branch',
  'friday-branch': 'friday_branch',
};

const FEATURE_ROUTE_MAP: Record<string, (slug: string) => Href> = {
  portal: (slug) => parentTabRoute(slug, 'home'),
  home: (slug) => parentTabRoute(slug, 'home'),
  billing: (slug) => parentTabRoute(slug, 'billing'),
  messages: (slug) => parentTabRoute(slug, 'messages'),
  calendar: (slug) => parentTabRoute(slug, 'calendar'),
  curriculum: (slug) => parentTabRoute(slug, 'home'),
  supply_list: (slug) => parentTabRoute(slug, 'home'),
  teaching_schedule: (slug) => parentTabRoute(slug, 'home'),
  attendance: (slug) => parentMoreRoute(slug, 'attendance'),
  children: (slug) => parentMoreRoute(slug, 'children'),
  committees: (slug) => parentMoreRoute(slug, 'committees'),
  classroom_signups: (slug) => parentMoreRoute(slug, 'classroom-signups'),
  forms_documents: (slug) => parentFormsDocumentsRoute(slug),
  friday_branch: (slug) => parentMoreRoute(slug, 'friday-branch'),
  notifications: (slug) => parentMoreRoute(slug, 'notifications'),
};

const PARENT_MORE_FEATURE_TO_MENU_ITEM: Record<string, ParentMoreMenuItemId> = {
  attendance: 'attendance',
  children: 'children',
  committees: 'committees',
  classroom_signups: 'classroom-signups',
  forms_documents: 'forms-documents',
  friday_branch: 'friday-branch',
  notifications: 'notifications',
};

function normalizeParentFeatureSegment(segment: string): string {
  return WEB_PARENT_FEATURE_ALIASES[segment] ?? segment.replace(/-/g, '_');
}

export function parseSchoolParentPortalHref(href: string): {
  programSlug?: string;
  featureKey: string;
  subtab?: string;
  query?: string;
} | null {
  const trimmed = href.trim();
  if (!trimmed) return null;

  try {
    const url = trimmed.startsWith('http')
      ? new URL(trimmed)
      : new URL(trimmed, 'https://trymudkitchen.com');
    const path = url.pathname;

    const programMatch = path.match(/\/school\/[^/]+\/parent\/p\/([^/]+)\/([^/]+)(?:\/([^/]+))?/);
    if (programMatch) {
      return {
        programSlug: decodeURIComponent(programMatch[1]),
        featureKey: normalizeParentFeatureSegment(programMatch[2]),
        subtab: programMatch[3] ? normalizeParentFeatureSegment(programMatch[3]) : undefined,
        query: url.search ? url.search.slice(1) : undefined,
      };
    }

    const mainMatch = path.match(/\/school\/[^/]+\/parent\/([^/]+)(?:\/([^/]+))?/);
    if (mainMatch && mainMatch[1] !== 'p') {
      return {
        featureKey: normalizeParentFeatureSegment(mainMatch[1]),
        subtab: mainMatch[2] ? normalizeParentFeatureSegment(mainMatch[2]) : undefined,
        query: url.search ? url.search.slice(1) : undefined,
      };
    }

    const mobileProgramMatch = path.match(/\/parent\/[^/]+\/p\/([^/]+)\/([^/]+)(?:\/([^/]+))?/);
    if (mobileProgramMatch) {
      return {
        programSlug: decodeURIComponent(mobileProgramMatch[1]),
        featureKey: normalizeParentFeatureSegment(mobileProgramMatch[2]),
        subtab: mobileProgramMatch[3]
          ? normalizeParentFeatureSegment(mobileProgramMatch[3])
          : undefined,
        query: url.search ? url.search.slice(1) : undefined,
      };
    }

    const mobileMainMatch = path.match(/\/parent\/[^/]+\/([^/]+)(?:\/([^/]+))?/);
    if (mobileMainMatch && mobileMainMatch[1] !== 'p' && mobileMainMatch[1] !== 'bulletin') {
      return {
        featureKey: normalizeParentFeatureSegment(mobileMainMatch[1]),
        subtab: mobileMainMatch[2]
          ? normalizeParentFeatureSegment(mobileMainMatch[2])
          : undefined,
        query: url.search ? url.search.slice(1) : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function getParentFeatureRoute(
  slug: string,
  featureKey: string,
  programSlug?: string,
): Href | null {
  const normalized = WEB_PARENT_FEATURE_ALIASES[featureKey] ?? featureKey.replace(/-/g, '_');

  if (programSlug) {
    const tabSegment = parentFeatureKeyToMobilePathSegment(normalized);
    if (tabSegment) {
      return parentProgramTabRoute(slug, programSlug, tabSegment);
    }
    const moreItem = PARENT_MORE_FEATURE_TO_MENU_ITEM[normalized];
    if (moreItem) {
      return parentProgramMoreRoute(slug, programSlug, moreItem);
    }
    if (normalized === 'portal' || normalized === 'home') {
      return parentProgramTabRoute(slug, programSlug, 'home');
    }
    return null;
  }

  const resolver = FEATURE_ROUTE_MAP[normalized];
  return resolver ? resolver(slug) : null;
}

export function resolveParentWebParentHrefToMobileRoute(
  slug: string,
  href: string,
  options?: { programSlug?: string },
): Href | null {
  const parsed = parseSchoolParentPortalHref(href);
  if (!parsed) return null;

  const programSlug = parsed.programSlug ?? options?.programSlug;
  const { featureKey, query } = parsed;

  if (query?.includes('tab=agreements')) {
    const formMatch = query.match(/(?:^|&)form=([^&]+)/);
    const formId = formMatch?.[1] ? decodeURIComponent(formMatch[1]) : undefined;
    if (programSlug) {
      return parentProgramTabRoute(slug, programSlug, 'billing');
    }
    return parentBillingAgreementsRoute(slug, formId);
  }

  const formMatch = query?.match(/(?:^|&)form=([^&]+)/);
  if (formMatch?.[1] && featureKey === 'forms_documents') {
    const formId = decodeURIComponent(formMatch[1]);
    if (programSlug) {
      return `${parentProgramMoreRoute(slug, programSlug, 'forms-documents')}/${encodeURIComponent(formId)}` as Href;
    }
    return parentFormDetailRoute(slug, formId);
  }

  return getParentFeatureRoute(slug, featureKey, programSlug);
}

export function resolveParentFeatureAnnouncementMobileRoute(
  slug: string,
  href: string,
  programSlug?: string,
): Href | null {
  return resolveParentWebParentHrefToMobileRoute(slug, href, { programSlug });
}

export function resolveParentDocumentationMobileRoute(
  slug: string,
  href: string,
  programSlug?: string,
): Href | null {
  return resolveParentWebParentHrefToMobileRoute(slug, href, { programSlug });
}

export function getOnboardingItemRoute(
  slug: string,
  target: string,
  options?: {
    healthApplicationId?: string | null;
    pickupApplicationId?: string | null;
    programSlug?: string;
  },
): Href | null {
  if (target.startsWith('url:')) return null;

  if (target === 'health') {
    if (!options?.healthApplicationId) return null;
    return parentChildDetailRoute(slug, options.healthApplicationId, 'health');
  }

  if (target === 'pickup') {
    if (!options?.pickupApplicationId) return null;
    return parentChildDetailRoute(slug, options.pickupApplicationId, 'pickup');
  }

  return getParentFeatureRoute(slug, target, options?.programSlug);
}

function parseWebParentFeatureKey(href: string): string | null {
  const match = href.match(/\/parent\/([^/?]+)/);
  if (!match?.[1]) return null;
  return WEB_PARENT_FEATURE_ALIASES[match[1]] ?? match[1].replace(/-/g, '_');
}

export function resolveParentAttentionNavigation(
  slug: string,
  item: {
    target?: string;
    href?: string;
    formId?: string;
    enrollmentApplicationId?: string;
    enrollmentTemplateItemId?: string;
    enrollmentSectionId?: string;
    healthApplicationId?: string | null;
    pickupApplicationId?: string | null;
    programSlug?: string;
  },
): Href | null {
  const programSlug = item.programSlug;

  if (item.formId && item.href?.includes('/billing') && item.href.includes('tab=agreements')) {
    if (programSlug) {
      return parentProgramTabRoute(slug, programSlug, 'billing');
    }
    return parentBillingAgreementsRoute(slug, item.formId);
  }

  if (item.formId) {
    if (programSlug) {
      return `${parentProgramMoreRoute(slug, programSlug, 'forms-documents')}/${encodeURIComponent(item.formId)}` as Href;
    }
    return parentFormDetailRoute(slug, item.formId);
  }

  if (item.enrollmentApplicationId) {
    return parentEnrollmentItemRoute(
      slug,
      item.enrollmentApplicationId,
      item.enrollmentTemplateItemId,
      item.enrollmentSectionId,
    );
  }

  if (item.target) {
    const route = getOnboardingItemRoute(slug, item.target, {
      healthApplicationId: item.healthApplicationId,
      pickupApplicationId: item.pickupApplicationId,
      programSlug,
    });
    if (route) return route;
  }

  if (item.href) {
    if (item.href.startsWith('/parent/')) {
      return item.href as Href;
    }

    const mobileFromWeb = resolveParentWebParentHrefToMobileRoute(slug, item.href, { programSlug });
    if (mobileFromWeb) return mobileFromWeb;

    const enrollment = parseEnrollmentHref(item.href);
    if (enrollment) {
      return parentEnrollmentItemRoute(
        slug,
        enrollment.applicationId,
        enrollment.templateItemId,
        enrollment.sectionId,
      );
    }

    const formsMatch = item.href.match(/[?&]form=([^&]+)/);
    if (formsMatch?.[1]) {
      const formId = decodeURIComponent(formsMatch[1]);
      if (item.href.includes('/billing') && item.href.includes('tab=agreements')) {
        return parentBillingAgreementsRoute(slug, formId);
      }
      if (item.href.includes('forms_documents')) {
        return parentFormDetailRoute(slug, formId);
      }
    }

    if (item.href.includes('/billing') && item.href.includes('tab=agreements')) {
      return parentBillingAgreementsRoute(slug);
    }

    const featureKey = parseWebParentFeatureKey(item.href);
    if (featureKey) {
      const route = getParentFeatureRoute(slug, featureKey, programSlug);
      if (route) return route;
    }
  }

  return null;
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
