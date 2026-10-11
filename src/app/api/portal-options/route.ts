import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { listSchoolPortalOptionsForUser } from "@/lib/auth/portal-switcher-server";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import {
  createClientFromRequest,
  getUserFromRequest,
  signedInErrorForRequest,
} from "@/lib/supabase/request-client";

const ROUTE = "/api/portal-options";

export async function GET(request: Request) {
  const supabase = await createClientFromRequest(request);
  const {
    data: { user },
    error: authError,
  } = await getUserFromRequest(supabase, request);

  if (!user) {
    return apiError(ROUTE, {
      request,
      status: 401,
      error: await signedInErrorForRequest(request, authError),
      code: "unauthorized",
    });
  }

  const url = new URL(request.url);
  const organizationId = url.searchParams.get("organizationId")?.trim() ?? "";
  const slug = url.searchParams.get("slug")?.trim() ?? "";

  if (!organizationId || !slug) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and slug are required.",
      code: "missing_fields",
    });
  }

  try {
    const org = await fetchOrganizationWithSettings(supabase, slug);

    if (!org || org.id !== organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const options = await listSchoolPortalOptionsForUser(supabase, user.id, slug, {
      org,
    });

    if (options.length === 0) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to this school.",
        code: "forbidden",
      });
    }

    return NextResponse.json({ options });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load portal options.",
      cause: err,
      code: "internal_error",
    });
  }
}
