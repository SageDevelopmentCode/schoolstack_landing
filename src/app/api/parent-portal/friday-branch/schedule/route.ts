import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadParentFridayBranchPageBundle } from "@/lib/parent-portal/friday-branch/load-parent-friday-branch";
import {
  ParentFridayBranchAuthError,
  requireParentFridayBranchAccess,
} from "@/lib/parent-portal/friday-branch/parent-friday-branch-auth";
import {
  FridayBranchParentPortalPausedError,
  assertFridayBranchParentPortalOpen,
} from "@/lib/school-admin/friday-branch/friday-branch-org-settings";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/friday-branch/schedule";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    // The Friday Branch access helper reports its own forbidden / not found errors.
    enforceAccess: false,
    fallbackErrorMessage: "Failed to load Friday Branch schedule.",
  },
  async ({ request, supabase, user, organizationId, access }) => {
    try {
      const { familyId, studentOptions } =
        await requireParentFridayBranchAccess(
          supabase,
          user,
          organizationId,
          access,
        );

      const admin = createAdminClient();
      await assertFridayBranchParentPortalOpen(admin, organizationId);

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

      if (err instanceof FridayBranchParentPortalPausedError) {
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
  },
);
