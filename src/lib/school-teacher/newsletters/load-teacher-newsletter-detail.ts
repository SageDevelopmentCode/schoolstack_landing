import "server-only";

import { apiError } from "@/lib/api/route-errors";
import {
  isTeacherNewslettersFeatureEnabled,
  loadParentNewsletterDetailBundleForOrganization,
  type ParentNewsletterDetailBundle,
} from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import type { createAdminClient } from "@/utils/supabase/admin";

/** One published edition for staff, or the API error to return. */
export async function loadTeacherNewsletterDetailOrError(
  request: Request,
  route: string,
  admin: ReturnType<typeof createAdminClient>,
  organizationId: string,
  editionId: string | undefined,
): Promise<{ ok: true; bundle: ParentNewsletterDetailBundle } | { ok: false; response: Response }> {
  if (!editionId) {
    return { ok: false, response: apiError(route, { request, status: 400, error: "editionId is required.", code: "missing_fields" }) };
  }
  try {
    const result = await loadParentNewsletterDetailBundleForOrganization(admin, organizationId, editionId, {
      isFeatureEnabled: isTeacherNewslettersFeatureEnabled,
    });
    if (result.ok) return { ok: true, bundle: result.bundle };
    if (result.reason === "feature_disabled") {
      return {
        ok: false,
        response: apiError(route, {
          request,
          status: 403,
          error: "Newsletters are not available for this school.",
          code: "feature_disabled",
        }),
      };
    }
    return {
      ok: false,
      response: apiError(route, {
        request,
        status: 404,
        error: result.reason === "org_not_found" ? "School not found." : "Newsletter not found.",
        code: "not_found",
      }),
    };
  } catch (err) {
    return {
      ok: false,
      response: apiError(route, { request, status: 500, error: "Failed to load newsletter.", cause: err, code: "load_failed" }),
    };
  }
}
