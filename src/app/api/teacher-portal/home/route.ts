import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { fetchTeacherDashboardSummary } from "@/lib/school-teacher/teacher-dashboard-summary";
import { buildTeacherDocumentationGuides } from "@/lib/school-teacher/teacher-documentation";
import {
  getStaffUserProfile,
  loadTeacherPortalContext,
} from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/teacher-portal/home";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
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
    const org = await fetchOrganizationWithSettings(slug);
    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    // One link-group read + one parallel memberships/staff read; the helpers below and the
    // dashboard summary reuse it through the request-scoped teacher context.
    const teacherContext = await loadTeacherPortalContext(
      supabase,
      user.id,
      organizationId,
    );
    if (!teacherContext.hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the teacher portal.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();

    const [userProfile, summary] = await Promise.all([
      getStaffUserProfile(supabase, user.id, organizationId, user),
      fetchTeacherDashboardSummary(
        supabase,
        admin,
        organizationId,
        slug,
        org.features,
        {
          schoolName: org.name,
          userId: user.id,
          staffMemberId: teacherContext.staffMember?.id ?? null,
        },
      ),
    ]);

    const roleTitle =
      typeof teacherContext.staffMember?.role_title === "string"
        ? teacherContext.staffMember.role_title
        : null;
    const portalRole = teacherContext.portalRole;

    const documentationGuides = buildTeacherDocumentationGuides({
      slug,
      features: org.features,
      bulletinEnabled: summary.bulletinEnabled,
    });

    return NextResponse.json({
      branding: org.branding,
      schoolSlug: slug,
      schoolName: org.name,
      organizationId: org.id,
      features: org.features,
      userProfile,
      roleTitle,
      portalRole,
      summary,
      documentationGuides,
    });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load home data.",
      cause: err,
      code: "internal_error",
    });
  }
}
