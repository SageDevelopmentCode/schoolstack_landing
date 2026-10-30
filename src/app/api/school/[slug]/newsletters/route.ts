import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  importNewsletterWorkspaceFromClient,
  loadNewsletterWorkspaceForAdmin,
  NewsletterError,
} from "@/lib/school-admin/newsletter/newsletter-db";
import { newsletterPrimaryFromBranding } from "@/lib/school-admin/newsletter/newsletter-branding-meta";
import type { NewsletterWorkspaceState } from "@/lib/school-admin/newsletter/newsletter-types";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/newsletters";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

async function resolveOrganization(
  admin: ReturnType<typeof createAdminClient>,
  slug: string,
): Promise<{ id: string; name: string; branding: OrganizationBranding | null } | null> {
  const { data, error } = await admin
    .from("organizations")
    .select("id, name")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data?.id) return null;

  const { data: settingsRow } = await admin
    .from("organization_settings")
    .select("branding")
    .eq("organization_id", data.id)
    .maybeSingle();

  const branding = (settingsRow?.branding as OrganizationBranding | null) ?? null;

  return {
    id: String(data.id),
    name: String(data.name),
    branding,
  };
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    const admin = createAdminClient();
    const org = await resolveOrganization(admin, slug);

    if (!org) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, org.id, request);

    const primaryColor = org.branding
      ? newsletterPrimaryFromBranding(org.branding)
      : "#477455";

    const workspace = await loadNewsletterWorkspaceForAdmin(admin, org.id, {
      schoolName: org.name,
      primaryColor,
    });

    return NextResponse.json(workspace);
  } catch (err) {
    if (err instanceof SchoolAdminAuthError) {
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
      error: "Failed to load newsletters.",
      cause: err,
    });
  }
}

type ImportBody = {
  workspace?: NewsletterWorkspaceState;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    const admin = createAdminClient();
    const org = await resolveOrganization(admin, slug);

    if (!org) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    const user = await requireSchoolAdminUser(supabase, org.id, request);
    const body = (await request.json()) as ImportBody;
    if (!body.workspace?.template || !Array.isArray(body.workspace.editions)) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid import payload.",
        code: "invalid_body",
      });
    }

    const staffMemberId = await getStaffMemberIdForUser(admin, user.id, org.id);

    const workspace = await importNewsletterWorkspaceFromClient(
      admin,
      org.id,
      body.workspace,
      staffMemberId,
    );

    return NextResponse.json(workspace);
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
      error: "Failed to import newsletters.",
      cause: err,
    });
  }
}
