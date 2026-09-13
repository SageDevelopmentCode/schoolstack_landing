import type {
  AdmissionsSetupStatus,
  AdmissionsSetupStep,
  AdmissionsSetupStepId,
  AdmissionsSetupStepStatus,
} from '@/lib/school-admin/admissions-setup-status';

export type {
  AdmissionsSetupStatus,
  AdmissionsSetupStep,
  AdmissionsSetupStepId,
  AdmissionsSetupStepStatus,
};

export type DashboardFocusItem = {
  id: string;
  icon: 'application' | 'schedule' | 'message' | 'setup';
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  accent: 'forest' | 'sky' | 'gold' | 'berry';
  enabled: boolean;
};

export type DashboardQuickAction =
  | {
      id: string;
      title: string;
      subtitle: string;
      kind: 'link';
      href: string;
    }
  | {
      id: string;
      title: string;
      subtitle: string;
      kind: 'copy-apply-link';
      applyFormPublicPath: string;
    };

export type ActivityNotificationCategory =
  | 'applications'
  | 'payments'
  | 'enrollment'
  | 'committees'
  | 'other';

export type SchoolAdminActivityNotification = {
  id: string;
  action: string;
  title: string;
  summary: string;
  subjectLabel: string | null;
  guardianLabel: string | null;
  programName: string | null;
  detail: string;
  createdAt: string;
  href: string;
  ctaLabel: string;
  category: ActivityNotificationCategory;
};

export type ResolvedAdminFeatureAnnouncement = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  feature: string;
  href: string;
  publishedAt: string;
};

export type AdminDashboardSummary = {
  setupStatus: AdmissionsSetupStatus;
  focusItems: DashboardFocusItem[];
  signal: {
    headline: string;
    body: string;
    href: string;
    ctaLabel: string;
  } | null;
  metrics: DashboardMetric[];
  recentActivity: SchoolAdminActivityNotification[];
  quickActions: DashboardQuickAction[];
  featureAnnouncements: ResolvedAdminFeatureAnnouncement[];
  messagesUnreadCount: number;
  setupComplete: boolean;
};

export type MobileAdminDashboardSummary = Omit<
  AdminDashboardSummary,
  'focusItems' | 'recentActivity' | 'quickActions'
> & {
  focusItems: DashboardFocusItem[];
  recentActivity: SchoolAdminActivityNotification[];
  quickActions: DashboardQuickAction[];
};
