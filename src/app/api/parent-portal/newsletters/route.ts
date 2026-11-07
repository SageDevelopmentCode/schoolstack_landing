import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  isParentNewslettersFeatureEnabled,
  loadParentNewslettersListBundle,
} from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/newsletters";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    fallbackErrorMessage: "Failed to load newsletters.",
  },
  async ({ request, organizationId }) => {
    try {
      const admin = createAdminClient();
      const { data: settingsRow, error: settingsError } = await admin
        .from("organization_settings")
        .select("features")
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (settingsError) throw settingsError;

      if (!isParentNewslettersFeatureEnabled(settingsRow?.features as never)) {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "Newsletters are not available for this school.",
          code: "feature_disabled",
        });
      }

      const bundle = await loadParentNewslettersListBundle(
        admin,
        organizationId,
      );
      return NextResponse.json(bundle);
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load newsletters.",
        cause: err,
        code: "load_failed",
      });
    }
  },
);
