import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { revalidateOrganizationSettings } from "@/lib/organization-settings/revalidate";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/school-admin/revalidate-settings";

type Body = { organizationId?: string };

/**
 * Expires the cached organization + settings read after a browser-side save
 * (e.g. the platform-admin settings editor). School admins and platform admins only.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "Invalid request body.",
      code: "invalid_body",
    });
  }

  const organizationId = body.organizationId?.trim() ?? "";
  if (!organizationId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId is required.",
      code: "missing_fields",
    });
  }

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    await requireSchoolAdminUser(supabase, organizationId, request);

    const { data: organization, error } = await createAdminClient()
      .from("organizations")
      .select("slug")
      .eq("id", organizationId)
      .maybeSingle();
    if (error) throw error;

    revalidateOrganizationSettings(organization?.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
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
      error: "Failed to refresh school settings.",
      code: "internal_error",
      cause: err,
    });
  }
}
