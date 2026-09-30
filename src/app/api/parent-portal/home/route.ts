import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import { fetchOrganizationWithSettings } from "@/lib/organization-settings/fetch";
import { loadParentPortalHomeApiPayload } from "@/lib/parent-portal/load-parent-portal-home-api-payload";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";

const ROUTE = "/api/parent-portal/home";

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
  const programSlug = url.searchParams.get("programSlug")?.trim() || undefined;

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

    const payload = await loadParentPortalHomeApiPayload({
      supabase,
      user,
      org,
      slug,
      programSlug,
    });

    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "forbidden" || err.message === "forbidden_program") {
        return apiError(ROUTE, {
          request,
          status: 403,
          error: "You do not have access to the parent portal.",
          code: "forbidden",
        });
      }
      if (err.message === "program_not_found") {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: "Program not found.",
          code: "program_not_found",
        });
      }
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load home data.",
      cause: err,
      code: "internal_error",
    });
  }
}
