import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { claimProgramCoopSupplyItemForParent } from "@/lib/admissions/program-coop-supply-list-claim";
import { ProgramCoopSignupConflictError } from "@/lib/admissions/program-coop-storage-errors";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/supply-list/claim";

export async function POST(request: Request) {
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

  try {
    const body = (await request.json()) as {
      organizationId?: string;
      programId?: string;
      itemId?: string;
    };

    const organizationId = body.organizationId?.trim() ?? "";
    const programId = body.programId?.trim() ?? "";
    const itemId = body.itemId?.trim() ?? "";

    if (!organizationId || !programId || !itemId) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "organizationId, programId, and itemId are required.",
        code: "missing_fields",
      });
    }

    const admin = createAdminClient();
    const { item } = await claimProgramCoopSupplyItemForParent(supabase, admin, user, {
      organizationId,
      programId,
      itemId,
    });

    return NextResponse.json({ item });
  } catch (err) {
    if (err instanceof ProgramCoopSignupConflictError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
        cause: err,
      });
    }

    const message = err instanceof Error ? err.message : "Failed to sign up for item.";
    const status =
      message.includes("access") || message.includes("not signed up")
        ? 403
        : message.includes("cannot accept") || message.includes("not found")
          ? 400
          : 500;

    return apiError(ROUTE, {
      request,
      status,
      error: message,
      code: status === 500 ? "internal_error" : "claim_failed",
      cause: err,
    });
  }
}
