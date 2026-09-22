import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadParentFridayBranchPageBundle } from "@/lib/parent-portal/friday-branch/load-parent-friday-branch";
import { ParentFridayBranchAuthError, requireParentFridayBranchAccess } from "@/lib/parent-portal/friday-branch/parent-friday-branch-auth";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/friday-branch/schedule";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

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

  try {
    const { familyId, studentOptions } = await requireParentFridayBranchAccess(
      supabase,
      user,
      organizationId,
    );

    const admin = createAdminClient();
    const bundle = await loadParentFridayBranchPageBundle(
      admin,
      organizationId,
      familyId,
      studentOptions,
    );

    return NextResponse.json(bundle);
  } catch (err) {
    if (err instanceof ParentFridayBranchAuthError) {
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
      cause: err,
      code: "load_failed",
    });
  }
}
