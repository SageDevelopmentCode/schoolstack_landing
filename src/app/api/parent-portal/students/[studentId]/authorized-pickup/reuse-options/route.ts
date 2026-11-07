import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { authorizeParentStudentPickupAccess } from "@/lib/authorized-pickup/authorize-parent-student";
import { loadFamilyPickupReuseOptions } from "@/lib/authorized-pickup/load-family-pickup-reuse-options";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE =
  "/api/parent-portal/students/[studentId]/authorized-pickup/reuse-options";

export const GET = withParentPortalRoute<undefined, { studentId: string }>(
  {
    route: ROUTE,
    enforceAccess: false,
    fallbackErrorMessage: "Failed to load authorized pickup reuse options.",
  },
  async ({ request, supabase, user, organizationId, access, params }) => {
    const { studentId } = params;

    const pickupAccess = await authorizeParentStudentPickupAccess(
      supabase,
      user,
      organizationId,
      studentId,
      access,
    );

    if (!pickupAccess.ok) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error:
          "You do not have permission to view this student's authorized pickup list.",
        code: "forbidden",
      });
    }

    try {
      const admin = createAdminClient();
      const options = await loadFamilyPickupReuseOptions(
        admin,
        organizationId,
        studentId,
      );
      return NextResponse.json({ options });
    } catch (error) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load authorized pickup reuse options.",
        cause: error,
        code: "load_failed",
      });
    }
  },
);
