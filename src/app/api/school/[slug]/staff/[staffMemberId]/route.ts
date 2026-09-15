import { NextResponse } from "next/server";
import { ACTIVITY_ACTIONS, type ActivityAction } from "@/lib/activity-log";
import { apiError } from "@/lib/api/route-errors";
import {
  deactivateStaffPortalAccess,
  reactivateStaffPortalAccess,
  StaffMemberError,
  updateStaffMember,
  type StaffEmploymentStatus,
  type StaffPortalRole,
} from "@/lib/staff/staff-members";
import {
  getSchoolAdminUserProfile,
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { logSchoolAdminActivity } from "@/lib/school-admin/school-admin-activity";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/staff/[staffMemberId]";

type RouteContext = {
  params: Promise<{ slug: string; staffMemberId: string }>;
};

type PatchStaffBody = {
  firstName?: string;
  lastName?: string;
  roleTitle?: string;
  employmentStatus?: StaffEmploymentStatus;
  portalRole?: StaffPortalRole;
  action?: "deactivatePortalAccess" | "reactivatePortalAccess";
};

async function resolveOrganizationId(
  admin: ReturnType<typeof createAdminClient>,
  slug: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data?.id ? String(data.id) : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, staffMemberId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    let body: PatchStaffBody;
    try {
      body = (await request.json()) as PatchStaffBody;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const admin = createAdminClient();
    const organizationId = await resolveOrganizationId(admin, slug);

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const actor = getSchoolAdminUserProfile(user);

    let staffMember;
    let action: ActivityAction = ACTIVITY_ACTIONS.STAFF_UPDATED;
    let summary = "Updated staff member";

    if (body.action === "deactivatePortalAccess") {
      staffMember = await deactivateStaffPortalAccess(
        admin,
        organizationId,
        staffMemberId,
      );
      action = ACTIVITY_ACTIONS.STAFF_PORTAL_ACCESS_DEACTIVATED;
      summary = "Deactivated staff portal access";
    } else if (body.action === "reactivatePortalAccess") {
      staffMember = await reactivateStaffPortalAccess(
        admin,
        organizationId,
        staffMemberId,
      );
      action = ACTIVITY_ACTIONS.STAFF_PORTAL_ACCESS_REACTIVATED;
      summary = "Reactivated staff portal access";
    } else {
      staffMember = await updateStaffMember(admin, {
        organizationId,
        staffMemberId,
        firstName: body.firstName,
        lastName: body.lastName,
        roleTitle: body.roleTitle,
        employmentStatus: body.employmentStatus,
        portalRole: body.portalRole,
      });
    }

    void logSchoolAdminActivity(admin, {
      organizationId,
      actorUserId: user.id,
      actorEmail: actor.email,
      actorName: actor.displayName,
      action,
      summary,
      entityType: "staff_member",
      entityId: staffMemberId,
      metadata: {
        staffAction: body.action ?? "update",
        portalRole: body.portalRole ?? staffMember.portalRole,
      },
      request,
    });

    return NextResponse.json({ staffMember });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof StaffMemberError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error:
        error instanceof Error ? error.message : "Failed to update staff member.",
      code: "internal_error",
      cause: error,
    });
  }
}
