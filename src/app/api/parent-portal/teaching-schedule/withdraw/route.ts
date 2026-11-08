import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { portalRouteErrorStatus } from "@/lib/api/portal-route-errors";
import { withdrawProgramCoopTeachingScheduleForParent } from "@/lib/admissions/program-coop-teaching-schedule-signup";
import type { TeachingScheduleParentRole } from "@/lib/admissions/program-coop-teaching-schedule-mock";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/teaching-schedule/withdraw";

function parseRole(value: string | undefined): TeachingScheduleParentRole | null {
  if (value === "instructor" || value === "assistant") return value;
  return null;
}

export const POST = withParentPortalRoute<{ weekId?: string; role?: string }>(
  {
    route: ROUTE,
    organizationFrom: "body",
    programScope: "required",
    missingOrganizationMessage: "organizationId, programId, weekId, and role are required.",
    missingProgramMessage: "organizationId, programId, weekId, and role are required.",
    fallbackErrorMessage: "Failed to withdraw from teaching week.",
  },
  async ({ request, supabase, user, organizationId, programId, body }) => {
    try {
      const weekId = typeof body.weekId === "string" ? body.weekId.trim() : "";
      const role = parseRole(typeof body.role === "string" ? body.role.trim() : undefined);

      if (!weekId || !role) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: "organizationId, programId, weekId, and role are required.",
          code: "missing_fields",
        });
      }

      const admin = createAdminClient();
      const { week } = await withdrawProgramCoopTeachingScheduleForParent(supabase, admin, user, {
        organizationId,
        programId: programId!,
        weekId,
        role,
      });

      return NextResponse.json({ week });
    } catch (err) {
      const resolved = portalRouteErrorStatus(err, "Failed to withdraw from teaching week.");
      return apiError(ROUTE, {
        request,
        status: resolved.status,
        error: resolved.message,
        code: resolved.status === 500 ? "internal_error" : "withdraw_failed",
        cause: err,
      });
    }
  },
);
