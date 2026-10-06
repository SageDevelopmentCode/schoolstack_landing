import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  loadOrganizationFridayBranchSettings,
  parseOrganizationFridayBranchSettings,
  type OrganizationFridayBranchSettings,
} from "@/lib/school-admin/friday-branch/friday-branch-org-settings";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/friday-branch/settings";

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
    const settings = await loadOrganizationFridayBranchSettings(admin, organizationId);

    return NextResponse.json({ settings });
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
      error: "Failed to load Friday Branch settings.",
      code: "internal_error",
      cause: err,
    });
  }
}

function parsePatchSettings(body: unknown): OrganizationFridayBranchSettings | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const settingsRaw = record.settings;
  if (!settingsRaw || typeof settingsRaw !== "object") return null;
  return parseOrganizationFridayBranchSettings(settingsRaw as Record<string, unknown>);
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
    typeof record?.organizationId === "string" ? record.organizationId.trim() : "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  const settings = parsePatchSettings(body);
  if (!settings) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid Friday Branch settings.",
      code: "invalid_body",
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
        error: "Failed to save Friday Branch settings.",
        cause: existingError,
      });
    }

    if (existing) {
      const { error: updateError } = await admin
        .from("organization_settings")
        .update({ friday_branch: settings })
        .eq("organization_id", organizationId);

      if (updateError) {
        return apiError(ROUTE, {
          request,
          status: 500,
          error: "Failed to save Friday Branch settings.",
          cause: updateError,
        });
      }
    } else {
      const { error: insertError } = await admin.from("organization_settings").insert({
        organization_id: organizationId,
        friday_branch: settings,
      });

      if (insertError) {
        return apiError(ROUTE, {
          request,
          status: 500,
          error: "Failed to save Friday Branch settings.",
          cause: insertError,
        });
      }
    }

    return NextResponse.json({ settings });
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
      error: "Failed to save Friday Branch settings.",
      code: "internal_error",
      cause: err,
    });
  }
}
