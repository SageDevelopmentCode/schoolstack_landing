import type { SupabaseClient } from "@supabase/supabase-js";
import {
  familyHasEnrolledAccessInProgram,
  loadProgramParentPortalContext,
} from "@/lib/admissions/program-parent-portal-access";
import { getFamilyPreviewProfile } from "@/lib/admissions/family-preview-access";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { resolveMainParentOrganizationFeatures } from "@/lib/organization-settings/resolve-program-parent-features";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import { loadParentHomePreviewContentData } from "@/lib/parent-portal/load-parent-home-content-data";
import {
  resolveParentPortalHomeBulletinLimit,
  type ParentPortalHomeApiPayload,
} from "@/lib/parent-portal/load-parent-portal-home-api-payload";
import { fetchParentFeatureAnnouncements } from "@/lib/parent-portal/parent-feature-announcements";
import { buildParentDocumentationGuides } from "@/lib/parent-portal/parent-documentation";
import { loadHomeBulletinPosts } from "@/lib/school-bulletin/posts-home";
import {
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "@/lib/school-events/event-audience";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import { isSchoolGalleryEnabled } from "@/lib/school-gallery/gallery-enabled";
import { createAdminClient } from "@/utils/supabase/admin";

type PreviewOrg = {
  id: string;
  name: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  fridayBranchSettings: {
    parent_portal_paused: boolean;
  };
};

function featuresPayload(features: OrganizationFeatures): ParentPortalHomeApiPayload["features"] {
  return {
    parent: (features.parent ?? {}) as Record<string, boolean>,
    parent_home: (features.parent_home ?? {}) as Record<string, boolean>,
  };
}

export async function loadParentPortalHomePreviewApiPayload(input: {
  supabase: SupabaseClient;
  org: PreviewOrg;
  slug: string;
  organizationId: string;
  familyId: string;
  previewParentBasePath: string;
  programSlug?: string;
}): Promise<ParentPortalHomeApiPayload> {
  const { supabase, org, slug, organizationId, familyId, previewParentBasePath } =
    input;
  const programSlug = input.programSlug?.trim() || undefined;
  const bulletinEnabled = Boolean(org.features.admin?.bulletin);
  const schoolGalleryEnabled = isSchoolGalleryEnabled(org.features);
  const admin = createAdminClient();

  const userProfile = await getFamilyPreviewProfile(supabase, organizationId, familyId);

  if (!programSlug) {
    const features = resolveMainParentOrganizationFeatures(org.features);
    const homeContent = await loadParentHomePreviewContentData({
      organizationId,
      familyId,
      slug,
      features,
      previewBasePath: previewParentBasePath,
      fridayBranchSettings: org.fridayBranchSettings,
      supabase,
    });

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
        features,
        coopModeEnabled: false,
        bulletinEnabled,
      }),
    ]);

    const documentationGuides = buildParentDocumentationGuides({
      slug,
      features,
      coopModeEnabled: false,
      bulletinEnabled,
    });

    return {
      branding: org.branding,
      schoolSlug: slug,
      schoolName: org.name,
      organizationId,
      features: featuresPayload(features),
      userProfile,
      familyChildren: homeContent.familyChildren,
      quickActions: buildParentQuickActions(slug, features, previewParentBasePath),
      onboardingItems: homeContent.onboardingItems,
      upcomingEvents,
      enrollmentAmendmentBannerItems: homeContent.enrollmentAmendmentBannerItems,
      enrollmentIncompleteBannerItems: homeContent.enrollmentIncompleteBannerItems,
      formAttentionItems: homeContent.formAttentionItems,
      formSnapshot: homeContent.formSnapshot,
      bulletinEnabled,
      schoolGalleryEnabled,
      bulletinPosts,
      fridayBranchHome: homeContent.fridayBranchHome ?? null,
      fridayBranchParentPortalPaused: org.fridayBranchSettings.parent_portal_paused,
      featureAnnouncements,
      documentationGuides,
    };
  }

  const programContext = await loadProgramParentPortalContext({
    supabase,
    organizationId,
    schoolSlug: slug,
    programSlug,
    orgFeatures: org.features,
    previewParentBasePath,
  });

  if (!programContext) {
    throw new Error("program_not_found");
  }

  const hasProgramAccess = await familyHasEnrolledAccessInProgram(
    supabase,
    organizationId,
    familyId,
    programContext.programId,
  );
  if (!hasProgramAccess) {
    throw new Error("forbidden_program");
  }

  const features = programContext.effectiveFeatures;
  const coopModeEnabled = programContext.coopMode;
  const programId = programContext.programId;

  const homeContent = await loadParentHomePreviewContentData({
    organizationId,
    familyId,
    slug,
    features,
    previewBasePath: previewParentBasePath,
    programId,
    coopModeEnabled,
    fridayBranchSettings: org.fridayBranchSettings,
    supabase,
  });

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
      programSlug,
      parentNavBasePath: programContext.parentNavBasePath,
    }),
  ]);

  const documentationGuides = buildParentDocumentationGuides({
    slug,
    features,
    coopModeEnabled,
    bulletinEnabled,
    programSlug,
    parentNavBasePath: programContext.parentNavBasePath,
    previewBasePath: previewParentBasePath.replace(/\/parent$/, ""),
  });

  return {
    branding: org.branding,
    schoolSlug: slug,
    schoolName: org.name,
    organizationId,
    features: featuresPayload(features),
    userProfile,
    familyChildren: homeContent.familyChildren,
    quickActions: buildParentQuickActions(
      slug,
      features,
      programContext.parentNavBasePath,
    ),
    onboardingItems: homeContent.onboardingItems,
    upcomingEvents,
    enrollmentAmendmentBannerItems: homeContent.enrollmentAmendmentBannerItems,
    enrollmentIncompleteBannerItems: homeContent.enrollmentIncompleteBannerItems,
    formAttentionItems: homeContent.formAttentionItems,
    formSnapshot: homeContent.formSnapshot,
    bulletinEnabled,
    schoolGalleryEnabled,
    bulletinPosts,
    fridayBranchHome: homeContent.fridayBranchHome ?? null,
    fridayBranchParentPortalPaused: org.fridayBranchSettings.parent_portal_paused,
    programId,
    programSlug,
    programPortalLabel: programContext.displayLabel,
    coopModeEnabled,
    parentNavBasePath: programContext.parentNavBasePath,
    coopFamilies: homeContent.coopFamilies,
    featureAnnouncements,
    documentationGuides,
  };
}
