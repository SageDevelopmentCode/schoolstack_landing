import type { ParentHomeAttentionItem } from '@/components/parent/home/parent-home-attention';
import type { ParentSignupAttentionItem } from '@/lib/parent/parent-classroom-signups-types';
import type {
  ParentDocGuide,
  ParentHomeData,
  ProgramCoopFamily,
  ResolvedParentFeatureAnnouncement,
  ResolvedParentOnboardingItem,
} from '@/lib/parent/parent-portal-api';

/**
 * Everything the parent Home renders and every action it can take. Built by the
 * main and program Home controllers; consumed by the Hub and its sections.
 */
export type ParentHomeDashboardProps = {
  slug: string;
  programSlug?: string;
  programPortalLabel?: string;
  coopModeEnabled?: boolean;
  programId?: string;
  coopFamilies?: ProgramCoopFamily[];
  featureAnnouncements?: ResolvedParentFeatureAnnouncement[];
  documentationGuides?: ParentDocGuide[];
  data: ParentHomeData;
  isPreview: boolean;
  isRefreshing: boolean;
  notificationUnreadCount: number;
  signupAttentionItems: ParentSignupAttentionItem[];
  sourcePagePath: string;
  onRefresh: () => void;
  onMarkedNotificationsRead: () => void;
  onAttentionItem: (item: ParentHomeAttentionItem) => void;
  onOnboardingItem: (item: ResolvedParentOnboardingItem) => void;
  onViewCalendar: () => void;
  onOpenMessages: () => void;
  onOpenChildDetails: (applicationId: string) => void;
  onOpenEnrollment: (applicationId: string) => void;
  onOpenForm: (formId: string) => void;
  onViewAllForms: () => void;
  onOpenBulletinPost: (postId: string) => void;
  onFeatureAnnouncement: (announcement: ResolvedParentFeatureAnnouncement) => void;
  onDocumentationStep: (href: string) => void;
  onCoopMessageThread: (threadId: string) => void;
  parentNavBasePath?: string;
};
