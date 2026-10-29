import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  restoreNewsletterEditionVersion,
  NewsletterError,
} from "@/lib/school-admin/newsletter/newsletter-db";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE =
  "/api/school/[slug]/newsletters/editions/[editionId]/versions/[versionId]/restore";

type RouteContext = {
  params: Promise<{ slug: string; editionId: string; versionId: string }>;
};

async function resolveOrganizationId(
  admin: ReturnType<typeof createAdminClient>,
  slug: string,
): Promise<string | null> {
  const { data, error } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data?.id ? String(data.id) : null;
}

export async function POST(request: Request, context: RouteContext) {
  const { slug, editionId, versionId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    const admin = createAdminClient();
    const organizationId = await resolveOrganizationId(admin, slug);

    if (!organizationId) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const staffMemberId = await getStaffMemberIdForUser(admin, user.id, organizationId);

    const edition = await restoreNewsletterEditionVersion(
      admin,
      organizationId,
      editionId,
      versionId,
      staffMemberId,
    );

    return NextResponse.json({ edition });
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
      });
    }
    if (err instanceof NewsletterError) {
      return apiError(ROUTE, {
        request,
        status: err.status,
        error: err.message,
        code: err.code,
      });
    }
    return apiError(ROUTE, {
      request,
      status: 500,
      error: "Failed to restore this version.",
      cause: err,
    });
  }
}
