import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import {
  loadProgramParentPortalContext,
  userHasEnrolledAccessInProgram,
  userHasMainPortalEnrollment,
} from "@/lib/admissions/program-parent-portal-access";
import {
  getFamilyUserProfile,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import type { ParentQuickAction } from "@/lib/organization-settings/parent-home";
import type { OrganizationEvent } from "@/lib/school-events/types";
import type { BulletinPost } from "@/lib/school-bulletin/types";
import type { FamilyUserProfile } from "@/lib/admissions/parent-portal-access";
import { loadHomeBulletinPosts } from "@/lib/school-bulletin/posts-home";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";
import { fetchParentFeatureAnnouncements } from "@/lib/parent-portal/parent-feature-announcements";
import type { ResolvedParentFeatureAnnouncement } from "@/lib/parent-portal/parent-feature-announcements";
import {
  buildParentDocumentationGuides,
  type ParentDocGuide,
} from "@/lib/parent-portal/parent-documentation";
import { loadParentHomeContentDataForAuthUser } from "@/lib/parent-portal/load-parent-home-content-data";
import type { ParentFridayBranchPageBundle } from "@/lib/parent-portal/friday-branch/types";
import type { ParentFormHomeSnapshot } from "@/lib/school-parent/forms-documents/load-parent-form-home-snapshot";
import type { ParentFormAttentionItem } from "@/lib/school-parent/forms-documents/load-parent-form-attention-items";
import type { EnrollmentAgreementAmendmentBannerItem } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import type { EnrollmentAgreementIncompleteBannerItem } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";
import { createAdminClient } from "@/utils/supabase/admin";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { loadResolvedParentOnboardingItems } from "@/lib/admissions/parent-onboarding-status";

type OrganizationWithSettings = NonNullable<Awaited<ReturnType<typeof fetchOrganizationWithSettings>>>;
type ResolvedParentOnboardingItem = Awaited<
  ReturnType<typeof loadResolvedParentOnboardingItems>
>[number];

/** Bulletin feed cap on program portal home (matches web co-op portal). */
export function resolveParentPortalHomeBulletinLimit(coopModeEnabled: boolean): number {
  return coopModeEnabled ? 3 : 25;
}

export type ParentPortalHomeApiPayload = {
  branding: OrganizationBranding;
  schoolSlug: string;
  schoolName: string;
  organizationId: string;
  features: {
    parent: Record<string, boolean>;
    parent_home: Record<string, boolean>;
  };
  userProfile: FamilyUserProfile;
  familyChildren: FamilyChildOverview[];
  quickActions: ParentQuickAction[];
  onboardingItems: ResolvedParentOnboardingItem[];
  upcomingEvents: OrganizationEvent[];
  enrollmentAmendmentBannerItems: EnrollmentAgreementAmendmentBannerItem[];
  enrollmentIncompleteBannerItems: EnrollmentAgreementIncompleteBannerItem[];
  formAttentionItems: ParentFormAttentionItem[];
  formSnapshot: ParentFormHomeSnapshot | null;
  bulletinEnabled: boolean;
  bulletinPosts: BulletinPost[];
  fridayBranchHome: ParentFridayBranchPageBundle | null;
  programId?: string;
  programSlug?: string;
  programPortalLabel?: string;
  coopModeEnabled?: boolean;
  parentNavBasePath?: string;
  coopFamilies?: ProgramCoopFamily[];
  featureAnnouncements?: ResolvedParentFeatureAnnouncement[];
  documentationGuides?: ParentDocGuide[];
};

function featuresPayload(features: OrganizationFeatures): ParentPortalHomeApiPayload["features"] {
  return {
    parent: (features.parent ?? {}) as Record<string, boolean>,
    parent_home: (features.parent_home ?? {}) as Record<string, boolean>,
  };
}

export async function loadParentPortalHomeApiPayload(input: {
  supabase: SupabaseClient;
  user: User;
  org: OrganizationWithSettings;
  slug: string;
  programSlug?: string;
}): Promise<ParentPortalHomeApiPayload> {
  const { supabase, user, org, slug } = input;
  const userId = user.id;
  const organizationId = org.id;
  const bulletinEnabled = Boolean(org.features.admin?.bulletin);
  const admin = createAdminClient();

  const hasAccess = await userHasEnrolledAccess(supabase, userId, organizationId);
  if (!hasAccess) {
    throw new Error("forbidden");
  }

  const familyIds = await getFamilyIdsForUser(supabase, userId, organizationId);
  const familyId = familyIds[0];

  const userProfile = await getFamilyUserProfile(
    supabase,
    userId,
    organizationId,
    user,
  );

  if (!input.programSlug) {
    // Same gate as calendar/messages when program scope is omitted (see program-parent-portal-scope-access.test.ts).
    const hasMainPortalAccess = await userHasMainPortalEnrollment(
      supabase,
      userId,
      organizationId,
    );
    if (!hasMainPortalAccess) {
      throw new Error("forbidden");
    }

    const contentData = familyId
      ? await loadParentHomeContentDataForAuthUser({
          supabase,
          userId,
          organizationId,
          familyId,
          slug,
          features: org.features,
        })
      : null;

    const [upcomingEvents, bulletinPosts, featureAnnouncements] = await Promise.all([
      listUpcomingEventsForOrg(supabase, organizationId, 3, mainPortalAudienceScope()),
      loadHomeBulletinPosts({
        supabase,
        signedUrlClient: admin,
        organizationId,
        bulletinEnabled,
        viewer: "parent",
        limit: resolveParentPortalHomeBulletinLimit(false),
      }),
      fetchParentFeatureAnnouncements(admin, organizationId, {
        slug,
        features: org.features,
        coopModeEnabled: false,
        bulletinEnabled,
      }),
    ]);

    const documentationGuides = buildParentDocumentationGuides({
      slug,
      features: org.features,
      coopModeEnabled: false,
      bulletinEnabled,
    });

    return {
      branding: org.branding,
      schoolSlug: slug,
      schoolName: org.name,
      organizationId,
      features: featuresPayload(org.features),
      userProfile,
      familyChildren: contentData?.familyChildren ?? [],
      quickActions: buildParentQuickActions(slug, org.features),
      onboardingItems: contentData?.onboardingItems ?? [],
      upcomingEvents,
      enrollmentAmendmentBannerItems: contentData?.enrollmentAmendmentBannerItems ?? [],
      enrollmentIncompleteBannerItems: contentData?.enrollmentIncompleteBannerItems ?? [],
      formAttentionItems: contentData?.formAttentionItems ?? [],
      formSnapshot: contentData?.formSnapshot ?? null,
      bulletinEnabled,
      bulletinPosts,
      fridayBranchHome: contentData?.fridayBranchHome ?? null,
      featureAnnouncements,
      documentationGuides,
    };
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId,
    schoolSlug: slug,
    programSlug: input.programSlug,
    orgFeatures: org.features,
  });

  if (!programContext) {
    throw new Error("program_not_found");
  }

  const hasProgramAccess = await userHasEnrolledAccessInProgram(
    supabase,
    userId,
    organizationId,
    programContext.programId,
  );
  if (!hasProgramAccess) {
    throw new Error("forbidden_program");
  }

  const features = programContext.effectiveFeatures;
  const coopModeEnabled = programContext.coopMode;
  const programId = programContext.programId;

  const contentData = familyId
    ? await loadParentHomeContentDataForAuthUser({
        supabase,
        userId,
        organizationId,
        familyId,
        slug,
        features,
        programId,
        coopModeEnabled,
      })
    : null;

  const [upcomingEvents, bulletinPosts, featureAnnouncements] = await Promise.all([
    listUpcomingEventsForOrg(
      supabase,
      organizationId,
      3,
      programPortalAudienceScope(programId),
    ),
    loadHomeBulletinPosts({
      supabase,
      signedUrlClient: admin,
      organizationId,
      bulletinEnabled,
      viewer: "parent",
      programId,
      limit: resolveParentPortalHomeBulletinLimit(coopModeEnabled),
    }),
    fetchParentFeatureAnnouncements(admin, organizationId, {
      slug,
      features,
      coopModeEnabled,
      bulletinEnabled,
      programSlug: input.programSlug,
      parentNavBasePath: programContext.parentNavBasePath,
    }),
  ]);

  const documentationGuides = buildParentDocumentationGuides({
    slug,
    features,
    coopModeEnabled,
    bulletinEnabled,
    programSlug: input.programSlug,
    parentNavBasePath: programContext.parentNavBasePath,
  });

  return {
    branding: org.branding,
    schoolSlug: slug,
    schoolName: org.name,
    organizationId,
    features: featuresPayload(features),
    userProfile,
    familyChildren: contentData?.familyChildren ?? [],
    quickActions: buildParentQuickActions(
      slug,
      features,
      programContext.parentNavBasePath,
    ),
    onboardingItems: contentData?.onboardingItems ?? [],
    upcomingEvents,
    enrollmentAmendmentBannerItems: contentData?.enrollmentAmendmentBannerItems ?? [],
    enrollmentIncompleteBannerItems: contentData?.enrollmentIncompleteBannerItems ?? [],
    formAttentionItems: contentData?.formAttentionItems ?? [],
    formSnapshot: contentData?.formSnapshot ?? null,
    bulletinEnabled,
    bulletinPosts,
    fridayBranchHome: contentData?.fridayBranchHome ?? null,
    programId,
    programSlug: input.programSlug,
    programPortalLabel: programContext.displayLabel,
    coopModeEnabled,
    parentNavBasePath: programContext.parentNavBasePath,
    coopFamilies: contentData?.coopFamilies,
    featureAnnouncements,
    documentationGuides,
  };
}
