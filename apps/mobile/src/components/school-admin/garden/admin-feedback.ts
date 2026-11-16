import type { GardenToastApi } from '@/components/parent/garden/toast';
import { resolveWebUrl } from '@/lib/admissions/school-apply-url';
import type { MobileErrorReporter } from '@/lib/mobile-error-reporter';
import { openExternalUrlSafely } from '@/lib/open-external-url';
import type {
  AdmissionsSetupStepId,
  DashboardMetric,
} from '@/lib/school-admin/dashboard-summary-types';
import { resolveSchoolAdminNativeRoute } from '@/lib/school-admin/school-admin-nav';

/** Strip a trailing arrow from server CTA labels ("Open →" → "Open"); Garden draws its own. */
export function ctaText(label: string): string {
  return label.replace(/\s*[→>]+\s*$/u, '').trim() || label;
}

/** `/school/{slug}/admin/{feature}[/{subtab}]`, the web admin path (mirrors web `schoolAdminPath`). */
export function webAdminPath(slug: string, feature: string, subtab?: string): string {
  const base = `/school/${slug}/admin/${feature}`;
  return subtab ? `${base}/${subtab}` : base;
}

/** Where each dashboard metric leads on the web (mirrors web `metricHref`). */
export function metricWebPath(slug: string, metric: DashboardMetric): string | null {
  switch (metric.id) {
    case 'active-applications':
      return webAdminPath(slug, 'admissions', 'submissions');
    case 'shadow-days':
      return `${webAdminPath(slug, 'schedule')}?tab=shadow`;
    case 'collected-month':
      return webAdminPath(slug, 'admissions', 'payments');
    case 'unread-messages':
      return webAdminPath(slug, 'messages');
    default:
      return null;
  }
}

/** Native route for a metric, or `null` when it only exists on the web portal. */
export function metricRoute(slug: string, metric: DashboardMetric): string | null {
  const web = metricWebPath(slug, metric);
  return web ? resolveSchoolAdminNativeRoute(slug, web) : null;
}

/** Where each go-live setup step is done on the web (mirrors web `admissions-setup-status`). */
export function setupStepWebPath(slug: string, stepId: AdmissionsSetupStepId): string {
  const flows = webAdminPath(slug, 'admissions', 'flows');
  switch (stepId) {
    case 'programs':
      return webAdminPath(slug, 'admissions', 'programs');
    case 'stripe':
      return webAdminPath(slug, 'admissions', 'payments');
    case 'apply_form':
      return `${flows}?flow=apply`;
    case 'enrollment_checklist':
      return `${flows}?flow=checklist`;
    case 'go_live':
    default:
      return webAdminPath(slug, 'admissions', 'submissions');
  }
}

/**
 * A tap with no in-app screen: never a silent no-op. Tells the admin it lives on
 * the web portal and offers to open it there (in-app browser, safely).
 */
export function notifyWebOnly(
  toast: GardenToastApi,
  {
    webPath,
    reportError,
    title = 'This opens on the web portal',
    description = "It isn't available in the app yet.",
  }: {
    webPath: string | null;
    reportError: MobileErrorReporter;
    title?: string;
    description?: string;
  },
) {
  toast.info(title, {
    id: 'admin-web-only',
    description,
    action: webPath
      ? {
          label: 'Open on web',
          onPress: () =>
            void openExternalUrlSafely(resolveWebUrl(webPath), reportError, {
              operation: 'school_admin_open_web_portal',
              metadata: { webPath },
            }),
        }
      : undefined,
  });
}
