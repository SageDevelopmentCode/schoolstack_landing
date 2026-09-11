import type {
  AdminDashboardSummary,
  DashboardFocusItem,
  DashboardQuickAction,
  MobileAdminDashboardSummary,
  SchoolAdminActivityNotification,
} from '@/lib/school-admin/dashboard-summary-types';
import { resolveSchoolAdminNativeRoute } from '@/lib/school-admin/school-admin-nav';

function isNativeFocusItem(slug: string, item: DashboardFocusItem): boolean {
  if (item.id.startsWith('setup-') || item.icon === 'setup') {
    return false;
  }
  return resolveSchoolAdminNativeRoute(slug, item.href) != null;
}

function isNativeActivityItem(slug: string, item: SchoolAdminActivityNotification): boolean {
  return resolveSchoolAdminNativeRoute(slug, item.href) != null;
}

function isNativeQuickAction(slug: string, action: DashboardQuickAction): boolean {
  if (action.kind === 'copy-apply-link') {
    return Boolean(action.applyFormPublicPath);
  }
  if (action.id === 'edit-apply-form') {
    return false;
  }
  return resolveSchoolAdminNativeRoute(slug, action.href) != null;
}

export function filterMobileDashboardSummary(
  slug: string,
  summary: AdminDashboardSummary,
): MobileAdminDashboardSummary {
  const signalRoute = summary.signal
    ? resolveSchoolAdminNativeRoute(slug, summary.signal.href)
    : null;

  return {
    setupStatus: summary.setupStatus,
    focusItems: summary.focusItems.filter((item) => isNativeFocusItem(slug, item)),
    signal: summary.signal
      ? signalRoute
        ? { ...summary.signal, href: signalRoute }
        : null
      : null,
    metrics: summary.metrics,
    recentActivity: summary.recentActivity.filter((item) => isNativeActivityItem(slug, item)),
    quickActions: summary.quickActions.filter((action) => isNativeQuickAction(slug, action)),
    messagesUnreadCount: summary.messagesUnreadCount,
    setupComplete: summary.setupComplete,
  };
}
