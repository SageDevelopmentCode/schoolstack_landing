import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { loadParentFormsDocumentsPageBundle } from "@/lib/school-parent/forms-documents/load-parent-forms";
import { withParentPortalRoute } from "@/lib/parent-portal/with-parent-portal-route";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/forms-documents";

export const GET = withParentPortalRoute(
  {
    route: ROUTE,
    feature: "forms_documents",
    fallbackErrorMessage: "Failed to load forms.",
  },
  async ({ request, organizationId, familyId }) => {
    try {
      if (!familyId) {
        return NextResponse.json({ items: [] });
      }

      const admin = createAdminClient();
      const bundle = await loadParentFormsDocumentsPageBundle(admin, organizationId, familyId);

      return NextResponse.json(bundle);
    } catch (err) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: "Failed to load forms.",
        cause: err,
        code: "load_failed",
      });
    }
  },
);
