import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  loadFridayBranchSchedule,
  parseFridayBranchSchedulePayload,
  saveFridayBranchSchedule,
} from "@/lib/school-admin/friday-branch/friday-branch-storage";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school-admin/friday-branch/schedule";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);

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
    const blocks = await loadFridayBranchSchedule(admin, organizationId);

    return NextResponse.json({ blocks });
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
      error: "Failed to load Friday Branch schedule.",
      code: "internal_error",
      cause: err,
    });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClientFromRequest(request);

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

  const blocks = parseFridayBranchSchedulePayload(record?.blocks);
  if (!blocks) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid Friday Branch schedule payload.",
      code: "invalid_body",
    });
  }

  try {
    await requireSchoolAdminUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const savedBlocks = await saveFridayBranchSchedule(admin, organizationId, blocks);

    return NextResponse.json({ blocks: savedBlocks });
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

    const message = err instanceof Error ? err.message : "Failed to save Friday Branch schedule.";
    const status = message.includes("end date") ? 400 : 500;

    return apiError(ROUTE, {
      request,
      status,
      error: message,
      code: status === 400 ? "invalid_body" : "internal_error",
      cause: err,
    });
  }
}
