import type { ParentSignupAttentionItem } from "@/lib/classroom-signups/types";
import type { ParentPortalHomeMeta } from "@/lib/parent-portal/parent-portal-home-meta";
import type {
  FamilyChildOverview,
  FamilyUserProfile,
} from "@/lib/admissions/parent-portal-access";
import type { ParentQuickAction } from "@/lib/organization-settings/parent-home";
import type { ResolvedParentOnboardingItem } from "@/lib/organization-settings/parent-onboarding";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import type { EnrollmentAgreementIncompleteBannerItem } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { ParentFridayBranchPageBundle } from "@/lib/parent-portal/friday-branch/types";
import type { ResolvedParentFeatureAnnouncement } from "@/lib/parent-portal/parent-feature-announcements";
import type { ParentFormAttentionItem } from "@/lib/school-parent/forms-documents/load-parent-form-attention-items";
import type { ParentFormHomeSnapshot } from "@/lib/school-parent/forms-documents/load-parent-form-home-snapshot";
import type { OrganizationFridayBranchSettings } from "@/lib/school-admin/friday-branch/friday-branch-org-settings";

/** Props of the parent Home (`ParentHomePage`); shared by its Garden sections. */
export type ParentHomePageProps = {
  branding: OrganizationBranding;
  schoolSlug: string;
  organizationId?: string;
  familyId?: string;
  userProfile: FamilyUserProfile;
  familyChildren: FamilyChildOverview[];
  quickActions: ParentQuickAction[];
  onboardingItems?: ResolvedParentOnboardingItem[];
  upcomingEvents?: OrganizationEvent[];
  enrollmentAmendmentBannerItems?: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems?: EnrollmentAgreementIncompleteBannerItem[];
  formAttentionItems?: ParentFormAttentionItem[];
  formSnapshot?: ParentFormHomeSnapshot | null;
  classroomSignupAttentionItems?: ParentSignupAttentionItem[];
  homeMeta?: ParentPortalHomeMeta | null;
  contentDeferred?: boolean;
  deferSignupAttentionLoad?: boolean;
  previewMode?: boolean;
  previewBasePath?: string;
  programPortalLabel?: string;
  programId?: string;
  schoolName?: string;
  coopModeEnabled?: boolean;
  coopFamilies?: ProgramCoopFamily[];
  bulletinEnabled?: boolean;
  bulletinPosts?: BulletinPost[];
  /** Marketing preview only. Renders bulletin posts and a messages row together. */
  previewShowCommunicationCards?: boolean;
  previewMessagesPromo?: {
    title: string;
    subtitle: string;
  };
  features?: OrganizationFeatures;
  programSlug?: string;
  parentNavBasePath?: string;
  featureAnnouncements?: ResolvedParentFeatureAnnouncement[];
  fridayBranchHome?: ParentFridayBranchPageBundle | null;
  fridayBranchSettings?: OrganizationFridayBranchSettings | null;
};
