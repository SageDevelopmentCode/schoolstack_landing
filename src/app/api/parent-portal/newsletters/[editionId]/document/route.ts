import { apiError } from "@/lib/api/route-errors";
import { userHasEnrolledAccess } from "@/lib/admissions/parent-portal-access";
import { loadParentNewsletterDetailBundleForOrganization } from "@/lib/parent-portal/newsletters/load-parent-newsletters";
import { createClientFromRequest, getUserFromRequest, signedInErrorForRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/parent-portal/newsletters/[editionId]/document";

type RouteContext = {
  params: Promise<{ editionId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { editionId } = await context.params;
  const supabase = await createClientFromRequest(request);
  const organizationId = new URL(request.url).searchParams.get("organizationId")?.trim() ?? "";

  if (!organizationId || !editionId) {
    return apiError(ROUTE, {
      request,
      status: 400,
      error: "organizationId and editionId are required.",
      code: "missing_fields",
    });
  }

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

  try {
    const hasAccess = await userHasEnrolledAccess(supabase, user.id, organizationId);
    if (!hasAccess) {
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "You do not have access to the parent portal.",
        code: "forbidden",
      });
    }

    const admin = createAdminClient();
    const result = await loadParentNewsletterDetailBundleForOrganization(
      admin,
      organizationId,
      editionId,
    );

    if (!result.ok) {
      if (result.reason === "org_not_found" || result.reason === "not_found") {
        return apiError(ROUTE, {
          request,
          status: 404,
          error: result.reason === "org_not_found" ? "School not found." : "Newsletter not found.",
          code: "not_found",
        });
      }
      return apiError(ROUTE, {
        request,
        status: 403,
        error: "Newsletters are not available for this school.",
        code: "feature_disabled",
      });
    }

    return new Response(result.bundle.htmlDocument, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to load newsletter.",
      cause: err,
      code: "load_failed",
    });
  }
}
