import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadSchoolProfileBundle } from "@/lib/school-admin/school-profile/load-school-profile";
import { parseSchoolProfilePatch } from "@/lib/school-admin/school-profile/school-profile";
import { saveSchoolProfileBundle } from "@/lib/school-admin/school-profile/save-school-profile";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/school-profile";

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
    const bundle = await loadSchoolProfileBundle(admin, organizationId);

    return NextResponse.json(bundle);
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
      error: "Failed to load school profile.",
      code: "internal_error",
      cause: err,
    });
  }
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

  const patch = parseSchoolProfilePatch(organizationId, record);
  if (!patch) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid school profile payload.",
      code: "invalid_body",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const saved = await saveSchoolProfileBundle(admin, organizationId, patch);

    return NextResponse.json(saved);
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
      error: "Failed to save school profile.",
      code: "internal_error",
      cause: err,
    });
  }
}
