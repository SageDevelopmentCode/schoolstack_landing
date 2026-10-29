import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  createNewsletterEdition,
  loadNewsletterWorkspaceForAdmin,
  NewsletterError,
} from "@/lib/school-admin/newsletter/newsletter-db";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/newsletters/editions";

type RouteContext = {
  params: Promise<{ slug: string }>;
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

type CreateBody = {
  week?: string;
  weekEnd?: string;
  title?: string;
  cloneFromEditionId?: string;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
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
    const body = (await request.json()) as CreateBody;

    if (!body.week?.trim()) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Week beginning is required.",
        code: "missing_week",
      });
    }

    const workspace = await loadNewsletterWorkspaceForAdmin(admin, organizationId, {
      schoolName: "",
      primaryColor: "#477455",
    });

    const staffMemberId = await getStaffMemberIdForUser(admin, user.id, organizationId);

    const edition = await createNewsletterEdition(
      admin,
      organizationId,
      workspace.template,
      {
        week: body.week.trim(),
        weekEnd: body.weekEnd?.trim(),
        title: body.title?.trim(),
        cloneFromEditionId: body.cloneFromEditionId,
        createdByStaffMemberId: staffMemberId,
      },
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
      error: "Failed to create newsletter.",
      cause: err,
    });
  }
}
