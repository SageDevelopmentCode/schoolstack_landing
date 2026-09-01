import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  countStaffWithEventPermissions,
  loadOrganizationScheduleSettings,
  parseOrganizationScheduleSettings,
  validateOrganizationScheduleSettings,
  type OrganizationScheduleSettings,
} from "@/lib/school-events/schedule-settings";
import { listStaffMembers } from "@/lib/staff/staff-members";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/schedule/permissions";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const [settings, staffMembers] = await Promise.all([
      loadOrganizationScheduleSettings(admin, organizationId),
      listStaffMembers(admin, organizationId),
    ]);

    const permittedStaffCount = countStaffWithEventPermissions(
      staffMembers.map((member) => ({
        id: member.id,
        portalRole: member.portalRole,
        employmentStatus: member.employmentStatus,
      })),
      settings.event_permissions,
    );

    return NextResponse.json({ settings, permittedStaffCount });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load schedule permissions.",
      code: "internal_error",
      cause: err,
    });
  }
}

function parsePatchBody(body: unknown): OrganizationScheduleSettings | null {
  if (!body || typeof body !== "object") return null;
  return parseOrganizationScheduleSettings(body as Record<string, unknown>);
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid JSON body.",
      code: "invalid_body",
    });
  }

  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const organizationId =
    typeof record?.organizationId === "string"
      ? record.organizationId.trim()
      : "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const settings = parsePatchBody(record?.settings);
  if (!settings) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid schedule settings.",
      code: "invalid_body",
    });
  }

  const validationError = validateOrganizationScheduleSettings(settings);
  if (validationError) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: validationError,
      code: "invalid_settings",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const { data: existing, error: existingError } = await admin
      .from("organization_settings")
      .select("organization_id")
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (existingError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: existingError.message,
        cause: existingError,
      });
    }

    if (existing) {
      const { error: updateError } = await admin
        .from("organization_settings")
        .update({ schedule: settings })
        .eq("organization_id", organizationId);

      if (updateError) {
        return apiError(ROUTE, {
          request,
          status: 500,
          error: updateError.message,
          cause: updateError,
        });
      }
    } else {
      const { error: insertError } = await admin.from("organization_settings").insert({
        organization_id: organizationId,
        schedule: settings,
      });

      if (insertError) {
        return apiError(ROUTE, {
          request,
          status: 500,
          error: insertError.message,
          cause: insertError,
        });
      }
    }

    const staffMembers = await listStaffMembers(admin, organizationId);
    const permittedStaffCount = countStaffWithEventPermissions(
      staffMembers.map((member) => ({
        id: member.id,
        portalRole: member.portalRole,
        employmentStatus: member.employmentStatus,
      })),
      settings.event_permissions,
    );

    return NextResponse.json({ settings, permittedStaffCount });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to save schedule permissions.",
      code: "internal_error",
      cause: err,
    });
  }
}
