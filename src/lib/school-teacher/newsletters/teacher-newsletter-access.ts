import "server-only";

import { apiError } from "@/lib/api/route-errors";
import { isTeacherNewslettersFeatureEnabled } from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { TeacherPortalAuthError } from "@/lib/staff/teacher-portal-access";
import { requireTeacherPortalUser } from "@/lib/staff/teacher-portal-access-server";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

type Access = { ok: true; organizationId: string; admin: ReturnType<typeof createAdminClient> } | { ok: false; response: Response };

/**
 * Staff newsletter routes: `organizationId` from the query, a signed-in staff
 * member of that school (cookie or Bearer, so the mobile app works), and the
 * `teacher.newsletters` feature on.
 */
export async function requireTeacherNewsletterAccess(request: Request, route: string): Promise<Access> {
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";
  if (!organizationId) {
    return {
      ok: false,
      response: apiError(route, { request, status: 400, error: "organizationId is required.", code: "missing_fields" }),
    };
  }

  try {
    const supabase = await createClientFromRequest(request);
    await requireTeacherPortalUser(supabase, organizationId, request);

    const admin = createAdminClient();
    const { data: settingsRow, error } = await admin
      .from("organization_settings")
      .select("features")
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) throw error;

    if (!isTeacherNewslettersFeatureEnabled(settingsRow?.features as never)) {
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
    return { ok: true, organizationId, admin };
  } catch (err) {
    if (err instanceof TeacherPortalAuthError) {
      return {
        ok: false,
        response: apiError(route, { request, status: err.status, error: err.message, code: err.code, cause: err }),
      };
    }
    return {
      ok: false,
      response: apiError(route, { request, status: 500, error: "Failed to load newsletters.", code: "load_failed", cause: err }),
    };
  }
}
