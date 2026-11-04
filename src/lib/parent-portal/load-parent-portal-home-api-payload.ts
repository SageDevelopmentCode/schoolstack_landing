import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { ProgramCoopFamily } from "@/lib/admissions/program-coop-directory";
import { loadProgramParentPortalContext } from "@/lib/admissions/program-parent-portal-access";
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
import type { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { loadResolvedParentOnboardingItems } from "@/lib/admissions/parent-onboarding-status";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import {
  resolveParentPortalHomeAccess,
  userHasProgramEnrollment,
} from "@/lib/parent-portal/resolve-parent-portal-home-access";

type OrganizationWithSettings = NonNullable<Awaited<ReturnType<typeof fetchOrganizationWithSettings>>>;
type ResolvedParentOnboardingItem = Awaited<
  ReturnType<typeof loadResolvedParentOnboardingItems>
>[number];

/** Bulletin feed cap on parent portal home (web/mobile mini-feed shows 3). */
export function resolveParentPortalHomeBulletinLimit(_coopModeEnabled: boolean): number {
  return 3;
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
  schoolGalleryEnabled: boolean;
  parentNewslettersEnabled: boolean;
  bulletinPosts: BulletinPost[];
  fridayBranchHome: ParentFridayBranchPageBundle | null;
  fridayBranchParentPortalPaused: boolean;
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

function parentHomeSpanAttributes(input: {
  organizationId: string;
  hasProgramSlug: boolean;
  features: OrganizationFeatures;
  bulletinEnabled: boolean;
}) {
  return {
    organization_id: input.organizationId,
    has_program_slug: input.hasProgramSlug,
    forms_enabled: isParentFeatureEnabled(input.features, "forms_documents"),
    bulletin_enabled: input.bulletinEnabled,
  };
}

async function loadMainPortalHomeFeeds(input: {
  supabase: SupabaseClient;
  admin: SupabaseClient;
  organizationId: string;
  slug: string;
  features: OrganizationFeatures;
  bulletinEnabled: boolean;
  familyId: string | undefined;
  userId: string;
  fridayBranchSettings: OrganizationWithSettings["fridayBranchSettings"];
}) {
  const bulletinLimit = resolveParentPortalHomeBulletinLimit(false);
  const spanAttrs = parentHomeSpanAttributes({
    organizationId: input.organizationId,
    hasProgramSlug: false,
    features: input.features,
    bulletinEnabled: input.bulletinEnabled,
  });

  const contentPromise = input.familyId
    ? Sentry.startSpan(
        { name: "parent_home.content", op: "parent_home.content", attributes: spanAttrs },
        () =>
          loadParentHomeContentDataForAuthUser({
            supabase: input.supabase,
            userId: input.userId,
            organizationId: input.organizationId,
            familyId: input.familyId!,
            slug: input.slug,
            features: input.features,
            fridayBranchSettings: input.fridayBranchSettings,
          }),
      )
    : Promise.resolve(null);

  const eventsPromise = Sentry.startSpan(
    { name: "parent_home.events", op: "parent_home.events", attributes: spanAttrs },
    () =>
      listUpcomingEventsForOrg(
        input.supabase,
        input.organizationId,
        3,
        mainPortalAudienceScope(),
      ),
  );

  const bulletinPromise = Sentry.startSpan(
    { name: "parent_home.bulletin", op: "parent_home.bulletin", attributes: spanAttrs },
    () =>
      loadHomeBulletinPosts({
        supabase: input.supabase,
        signedUrlClient: input.admin,
        organizationId: input.organizationId,
        bulletinEnabled: input.bulletinEnabled,
        viewer: "parent",
        limit: bulletinLimit,
      }),
  );

  const announcementsPromise = Sentry.startSpan(
    {
      name: "parent_home.announcements",
      op: "parent_home.announcements",
      attributes: spanAttrs,
    },
    () =>
      fetchParentFeatureAnnouncements(input.admin, input.organizationId, {
        slug: input.slug,
        features: input.features,
        coopModeEnabled: false,
        bulletinEnabled: input.bulletinEnabled,
      }),
  );

  const [contentData, upcomingEvents, bulletinPosts, featureAnnouncements] =
    await Promise.all([
      contentPromise,
      eventsPromise,
      bulletinPromise,
      announcementsPromise,
    ]);

  return { contentData, upcomingEvents, bulletinPosts, featureAnnouncements };
}

async function loadProgramPortalHomeFeeds(input: {
  supabase: SupabaseClient;
  admin: SupabaseClient;
  organizationId: string;
  slug: string;
  programSlug: string;
  programId: string;
  features: OrganizationFeatures;
  bulletinEnabled: boolean;
  coopModeEnabled: boolean;
  parentNavBasePath: string;
  familyId: string | undefined;
  userId: string;
  fridayBranchSettings: OrganizationWithSettings["fridayBranchSettings"];
}) {
  const bulletinLimit = resolveParentPortalHomeBulletinLimit(input.coopModeEnabled);
  const spanAttrs = parentHomeSpanAttributes({
    organizationId: input.organizationId,
    hasProgramSlug: true,
    features: input.features,
    bulletinEnabled: input.bulletinEnabled,
  });

  const contentPromise = input.familyId
    ? Sentry.startSpan(
        { name: "parent_home.content", op: "parent_home.content", attributes: spanAttrs },
        () =>
          loadParentHomeContentDataForAuthUser({
            supabase: input.supabase,
            userId: input.userId,
            organizationId: input.organizationId,
            familyId: input.familyId!,
            slug: input.slug,
            features: input.features,
            programId: input.programId,
            coopModeEnabled: input.coopModeEnabled,
            fridayBranchSettings: input.fridayBranchSettings,
            programAccessVerified: true,
          }),
      )
    : Promise.resolve(null);

  const eventsPromise = Sentry.startSpan(
    { name: "parent_home.events", op: "parent_home.events", attributes: spanAttrs },
    () =>
      listUpcomingEventsForOrg(
        input.supabase,
        input.organizationId,
        3,
        programPortalAudienceScope(input.programId),
      ),
  );

  const bulletinPromise = Sentry.startSpan(
    { name: "parent_home.bulletin", op: "parent_home.bulletin", attributes: spanAttrs },
    () =>
      loadHomeBulletinPosts({
        supabase: input.supabase,
        signedUrlClient: input.admin,
        organizationId: input.organizationId,
        bulletinEnabled: input.bulletinEnabled,
        viewer: "parent",
        programId: input.programId,
        limit: bulletinLimit,
      }),
  );

  const announcementsPromise = Sentry.startSpan(
    {
      name: "parent_home.announcements",
      op: "parent_home.announcements",
      attributes: spanAttrs,
    },
    () =>
      fetchParentFeatureAnnouncements(input.admin, input.organizationId, {
        slug: input.slug,
        features: input.features,
        coopModeEnabled: input.coopModeEnabled,
        bulletinEnabled: input.bulletinEnabled,
        programSlug: input.programSlug,
        parentNavBasePath: input.parentNavBasePath,
      }),
  );

  const [contentData, upcomingEvents, bulletinPosts, featureAnnouncements] =
    await Promise.all([
      contentPromise,
      eventsPromise,
      bulletinPromise,
      announcementsPromise,
    ]);

  return { contentData, upcomingEvents, bulletinPosts, featureAnnouncements };
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
  const schoolGalleryEnabled = isSchoolGalleryEnabled(org.features);
  const parentNewslettersEnabled = isParentFeatureEnabled(org.features, "newsletters");
  const admin = createAdminClient();
  const hasProgramSlug = Boolean(input.programSlug?.trim());

  const access = await Sentry.startSpan(
    {
      name: "parent_home.access",
      op: "parent_home.access",
      attributes: parentHomeSpanAttributes({
        organizationId,
        hasProgramSlug,
        features: org.features,
        bulletinEnabled,
      }),
    },
    () =>
      resolveParentPortalHomeAccess({
        supabase,
        userId,
        organizationId,
        user,
      }),
  );

  if (!access.hasEnrolledAccess) {
    throw new Error("forbidden");
  }

  const { familyId, userProfile } = access;

  if (!input.programSlug) {
    if (!access.hasMainPortalEnrollment) {
      throw new Error("forbidden");
    }

    const { contentData, upcomingEvents, bulletinPosts, featureAnnouncements } =
      await loadMainPortalHomeFeeds({
        supabase,
        admin,
        organizationId,
        slug,
        features: org.features,
        bulletinEnabled,
        familyId,
        userId,
        fridayBranchSettings: org.fridayBranchSettings,
      });

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
      schoolGalleryEnabled,
      parentNewslettersEnabled,
      bulletinPosts,
      fridayBranchHome: contentData?.fridayBranchHome ?? null,
      fridayBranchParentPortalPaused: org.fridayBranchSettings.parent_portal_paused,
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

  if (!userHasProgramEnrollment(access.enrolledPrograms, programContext.programId)) {
    throw new Error("forbidden_program");
  }

  const features = programContext.effectiveFeatures;
  const coopModeEnabled = programContext.coopMode;
  const programId = programContext.programId;

  const { contentData, upcomingEvents, bulletinPosts, featureAnnouncements } =
    await loadProgramPortalHomeFeeds({
      supabase,
      admin,
      organizationId,
      slug,
      programSlug: input.programSlug,
      programId,
      features,
      bulletinEnabled,
      coopModeEnabled,
      parentNavBasePath: programContext.parentNavBasePath,
      familyId,
      userId,
      fridayBranchSettings: org.fridayBranchSettings,
    });

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
    schoolGalleryEnabled,
    parentNewslettersEnabled: isParentFeatureEnabled(features, "newsletters"),
    bulletinPosts,
    fridayBranchHome: contentData?.fridayBranchHome ?? null,
    fridayBranchParentPortalPaused: org.fridayBranchSettings.parent_portal_paused,
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
