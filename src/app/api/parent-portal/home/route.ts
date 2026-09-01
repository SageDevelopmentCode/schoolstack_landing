import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { getFamilyIdsForUser } from "@/lib/admissions/application-auth";
import { buildEnrollmentAgreementAmendmentBannerItems } from "@/lib/admissions/enrollment-agreement-amendment-banner";
import { buildEnrollmentAgreementIncompleteBannerItems } from "@/lib/admissions/enrollment-agreement-incomplete-banner";
import {
  listEnrollmentAgreementAmendmentsForApplications,
  listIncompleteEnrollmentAgreementsForApplications,
} from "@/lib/admissions/enrollment-checklist-materialization";
import { loadResolvedParentOnboardingItems } from "@/lib/admissions/parent-onboarding-status";
import {
  getFamilyUserProfile,
  listFamilyChildrenForHome,
  userHasEnrolledAccess,
} from "@/lib/admissions/parent-portal-access";
import { buildParentQuickActions } from "@/lib/organization-settings/parent-home";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { listUpcomingEventsForOrg } from "@/lib/school-events/events";
import { createClientFromRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/home";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: "You must be signed in.",
      code: "unauthorized",
    });
  }

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const slug = url.searchParams.get("slug")?.trim() ?? "";

  if (!organizationId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    const org = await fetchOrganizationWithSettings(supabase, slug);
    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const familyIds = await getFamilyIdsForUser(supabase, user.id, organizationId);
    const familyId = familyIds[0];

    const [userProfile, familyChildren, upcomingEvents] = await Promise.all([
      getFamilyUserProfile(supabase, user.id, organizationId, user),
      listFamilyChildrenForHome(supabase, organizationId, user.id),
      listUpcomingEventsForOrg(supabase, organizationId, 3),
    ]);
    const onboardingItems = familyId
      ? await loadResolvedParentOnboardingItems({
          supabase,
          organizationId,
          familyId,
          userId: user.id,
          slug,
          features: org.features,
          familyChildren,
        })
      : [];

    const applicationIds = familyChildren.map((child) => child.applicationId);
    const [amendmentsByApplicationId, incompleteByApplicationId] = await Promise.all([
      listEnrollmentAgreementAmendmentsForApplications(
        supabase,
        organizationId,
        applicationIds,
      ),
      listIncompleteEnrollmentAgreementsForApplications(
        supabase,
        organizationId,
        applicationIds,
      ),
    ]);

    const enrollmentAmendmentBannerItems = buildEnrollmentAgreementAmendmentBannerItems({
      schoolSlug: slug,
      familyChildren,
      amendmentsByApplicationId: Object.fromEntries(amendmentsByApplicationId.entries()),
    });
    const enrollmentIncompleteBannerItems = buildEnrollmentAgreementIncompleteBannerItems({
      schoolSlug: slug,
      familyChildren,
      incompleteByApplicationId: Object.fromEntries(incompleteByApplicationId.entries()),
    });

    const quickActions = buildParentQuickActions(slug, org.features);

    return NextResponse.json({
      branding: org.branding,
      schoolSlug: slug,
      schoolName: org.name,
      organizationId: org.id,
      userProfile,
      familyChildren,
      quickActions,
      onboardingItems,
      upcomingEvents,
      enrollmentAmendmentBannerItems,
      enrollmentIncompleteBannerItems,
    });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: err instanceof Error ? err.message : "Failed to load home data.",
      code: "internal_error",
      cause: err,
    });
  }
}
