import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { claimProgramCoopSupplyItemForParent } from "@/lib/admissions/program-coop-supply-list-claim";
import { ProgramCoopSignupConflictError } from "@/lib/admissions/program-coop-storage-errors";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/supply-list/claim";

export const POST = withParentPortalRoute<{ itemId?: string }>(
  {
    route: ROUTE,
    organizationFrom: "body",
    programScope: "required",
    missingOrganizationMessage: "organizationId, programId, and itemId are required.",
    missingProgramMessage: "organizationId, programId, and itemId are required.",
    fallbackErrorMessage: "Failed to sign up for item.",
  },
  async ({ request, supabase, user, organizationId, programId, body }) => {
    try {
      const itemId = typeof body.itemId === "string" ? body.itemId.trim() : "";
      if (!itemId) {
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
        programId: programId!,
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

      const resolved = portalRouteErrorStatus(err, "Failed to sign up for item.");
      return apiError(ROUTE, {
        request,
        status: resolved.status,
        error: resolved.message,
        code: resolved.status === 500 ? "internal_error" : "claim_failed",
        cause: err,
      });
    }
  },
);
