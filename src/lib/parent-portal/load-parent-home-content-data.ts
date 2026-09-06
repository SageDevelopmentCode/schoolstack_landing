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
import { filterFamilyChildrenForProgramPortal } from "@/components/school-parent/children/parent-children-utils";
import {
  familyHasEnrolledAccessInProgram,
  userHasEnrolledAccessInProgram,
} from "@/lib/admissions/program-parent-portal-access";
import {
  listProgramCoopFamilies,
  type ProgramCoopFamily,
} from "@/lib/admissions/program-coop-directory";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";
import { getRequestUser } from "@/lib/auth/session";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export type ParentHomeContentData = {
  familyChildren: Awaited<ReturnType<typeof listFamilyChildrenForHome>>;
  onboardingItems: Awaited<ReturnType<typeof loadResolvedParentOnboardingItems>>;
  enrollmentAmendmentBannerItems: ReturnType<typeof buildEnrollmentAgreementAmendmentBannerItems>;
  enrollmentIncompleteBannerItems: ReturnType<typeof buildEnrollmentAgreementIncompleteBannerItems>;
  coopFamilies?: ProgramCoopFamily[];
};

async function loadCoopFamiliesForHome(input: {
  organizationId: string;
  familyId: string;
  programId?: string;
  coopModeEnabled?: boolean;
  hasProgramAccess: boolean;
}): Promise<ProgramCoopFamily[] | undefined> {
  if (!input.coopModeEnabled || !input.programId || !input.hasProgramAccess) {
    return undefined;
  }

  const admin = createAdminClient();
  return listProgramCoopFamilies(admin, {
    organizationId: input.organizationId,
    programId: input.programId,
    currentFamilyId: input.familyId,
  });
}

export async function loadParentHomeContentData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
  features: OrganizationFeatures;
  previewBasePath?: string;
  programId?: string;
  coopModeEnabled?: boolean;
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

  const hasProgramAccess = input.programId
    ? await userHasEnrolledAccessInProgram(
        supabase,
        user.id,
        input.organizationId,
        input.programId,
      )
    : false;

  const familyChildren = input.programId
    ? filterFamilyChildrenForProgramPortal(
        await listFamilyChildrenForHome(supabase, input.organizationId, user.id),
        input.programId,
      )
    : await listFamilyChildrenForHome(supabase, input.organizationId, user.id);

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
  const [amendmentsByApplicationId, incompleteByApplicationId, coopFamilies] =
    await Promise.all([
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
    loadCoopFamiliesForHome({
      organizationId: input.organizationId,
      familyId: input.familyId,
      programId: input.programId,
      coopModeEnabled: input.coopModeEnabled,
      hasProgramAccess,
    }),
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
    coopFamilies,
  };
}

export async function loadParentHomePreviewContentData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
  features: OrganizationFeatures;
  previewBasePath?: string;
  programId?: string;
  coopModeEnabled?: boolean;
  supabase: SupabaseClient;
}): Promise<ParentHomeContentData> {
  const hasProgramAccess = input.programId
    ? await familyHasEnrolledAccessInProgram(
        input.supabase,
        input.organizationId,
        input.familyId,
        input.programId,
      )
    : false;

  const familyChildren = input.programId
    ? filterFamilyChildrenForProgramPortal(
        await listFamilyChildrenForHomeByFamilyId(
          input.supabase,
          input.organizationId,
          input.familyId,
        ),
        input.programId,
      )
    : await listFamilyChildrenForHomeByFamilyId(
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
  const [amendmentsByApplicationId, incompleteByApplicationId, coopFamilies] =
    await Promise.all([
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
    loadCoopFamiliesForHome({
      organizationId: input.organizationId,
      familyId: input.familyId,
      programId: input.programId,
      coopModeEnabled: input.coopModeEnabled,
      hasProgramAccess,
    }),
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
    coopFamilies,
  };
}
