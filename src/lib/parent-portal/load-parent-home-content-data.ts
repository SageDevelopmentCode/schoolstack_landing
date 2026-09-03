import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listEnrollmentAgreementAmendmentsForApplications,
  listIncompleteEnrollmentAgreementsForApplications,
} from "@/lib/admissions/enrollment-checklist-materialization";
import { buildEnrollmentAgreementAmendmentBannerItems } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import { buildEnrollmentAgreementIncompleteBannerItems } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import { listFamilyChildrenForHomeByFamilyId, getFamilyPreviewGuardianUserId } from "@/lib/admissions/family-preview-access";
import { listFamilyChildrenForHome } from "@/lib/admissions/parent-portal-access";
import { loadResolvedParentOnboardingItems } from "@/lib/admissions/parent-onboarding-status";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { getRequestUser } from "@/lib/auth/session";
import { createClient } from "@/utils/supabase/server";

export type ParentHomeContentData = {
  familyChildren: Awaited<ReturnType<typeof listFamilyChildrenForHome>>;
  onboardingItems: Awaited<ReturnType<typeof loadResolvedParentOnboardingItems>>;
  enrollmentAmendmentBannerItems: ReturnType<typeof buildEnrollmentAgreementAmendmentBannerItems>;
  enrollmentIncompleteBannerItems: ReturnType<typeof buildEnrollmentAgreementIncompleteBannerItems>;
};

export async function loadParentHomeContentData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
  features: OrganizationFeatures;
  previewBasePath?: string;
  supabase?: SupabaseClient;
}): Promise<ParentHomeContentData> {
  const user = await getRequestUser();
  if (!user) {
    return {
      familyChildren: [],
      onboardingItems: [],
      enrollmentAmendmentBannerItems: [],
      enrollmentIncompleteBannerItems: [],
    };
  }

  const cookieStore = await cookies();
  const supabase = input.supabase ?? createClient(cookieStore);

  const familyChildren = await listFamilyChildrenForHome(
    supabase,
    input.organizationId,
    user.id,
  );

  const onboardingItems = await loadResolvedParentOnboardingItems({
    supabase,
    organizationId: input.organizationId,
    familyId: input.familyId,
    userId: user.id,
    slug: input.slug,
    features: input.features,
    previewBasePath: input.previewBasePath,
    familyChildren,
  });

  const applicationIds = familyChildren.map((child) => child.applicationId);
  const [amendmentsByApplicationId, incompleteByApplicationId] = await Promise.all([
    listEnrollmentAgreementAmendmentsForApplications(
      supabase,
      input.organizationId,
      applicationIds,
    ),
    listIncompleteEnrollmentAgreementsForApplications(
      supabase,
      input.organizationId,
      applicationIds,
    ),
  ]);

  return {
    familyChildren,
    onboardingItems,
    enrollmentAmendmentBannerItems: buildEnrollmentAgreementAmendmentBannerItems({
      schoolSlug: input.slug,
      familyChildren,
      amendmentsByApplicationId: Object.fromEntries(amendmentsByApplicationId.entries()),
      previewBasePath: input.previewBasePath,
    }),
    enrollmentIncompleteBannerItems: buildEnrollmentAgreementIncompleteBannerItems({
      schoolSlug: input.slug,
      familyChildren,
      incompleteByApplicationId: Object.fromEntries(incompleteByApplicationId.entries()),
      previewBasePath: input.previewBasePath,
    }),
  };
}

export async function loadParentHomePreviewContentData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
  features: OrganizationFeatures;
  previewBasePath?: string;
  supabase: SupabaseClient;
}): Promise<ParentHomeContentData> {
  const familyChildren = await listFamilyChildrenForHomeByFamilyId(
    input.supabase,
    input.organizationId,
    input.familyId,
  );

  const previewGuardianUserId = await getFamilyPreviewGuardianUserId(
    input.supabase,
    input.organizationId,
    input.familyId,
  );
  const onboardingItems = await loadResolvedParentOnboardingItems({
    supabase: input.supabase,
    organizationId: input.organizationId,
    familyId: input.familyId,
    userId: previewGuardianUserId ?? "00000000-0000-0000-0000-000000000000",
    slug: input.slug,
    features: input.features,
    previewBasePath: input.previewBasePath,
    familyChildren,
  });

  const applicationIds = familyChildren.map((child) => child.applicationId);
  const [amendmentsByApplicationId, incompleteByApplicationId] = await Promise.all([
    listEnrollmentAgreementAmendmentsForApplications(
      input.supabase,
      input.organizationId,
      applicationIds,
    ),
    listIncompleteEnrollmentAgreementsForApplications(
      input.supabase,
      input.organizationId,
      applicationIds,
    ),
  ]);

  return {
    familyChildren,
    onboardingItems,
    enrollmentAmendmentBannerItems: buildEnrollmentAgreementAmendmentBannerItems({
      schoolSlug: input.slug,
      familyChildren,
      amendmentsByApplicationId: Object.fromEntries(amendmentsByApplicationId.entries()),
      previewBasePath: input.previewBasePath,
    }),
    enrollmentIncompleteBannerItems: buildEnrollmentAgreementIncompleteBannerItems({
      schoolSlug: input.slug,
      familyChildren,
      incompleteByApplicationId: Object.fromEntries(incompleteByApplicationId.entries()),
      previewBasePath: input.previewBasePath,
    }),
  };
}
