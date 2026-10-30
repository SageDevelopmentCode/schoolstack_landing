import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  upsertNewsletterTemplate,
  NewsletterError,
} from "@/lib/school-admin/newsletter/newsletter-db";
import type { NewsletterSchoolTemplate } from "@/lib/school-admin/newsletter/newsletter-types";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/newsletters/template";

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

type PutBody = {
  template?: NewsletterSchoolTemplate;
};

export async function PUT(request: Request, context: RouteContext) {
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

    await requireSchoolAdminUser(supabase, organizationId, request);
    const body = (await request.json()) as PutBody;

    if (!body.template?.storyBlocks?.length) {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Template payload is required.",
        code: "invalid_body",
      });
    }

    const template = await upsertNewsletterTemplate(admin, organizationId, body.template);

    return NextResponse.json({ template });
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
      error: "Failed to save newsletter template.",
      cause: err,
    });
  }
}
