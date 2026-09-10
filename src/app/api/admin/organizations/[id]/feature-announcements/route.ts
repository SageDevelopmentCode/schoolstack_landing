import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAdminFeatureAnnouncement,
  listGlobalAdminFeatureAnnouncements,
  listOrgAdminFeatureAnnouncements,
  type AdminFeatureAnnouncementInput,
} from "@/lib/admin/admin-feature-announcements-storage";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { mergeAnnouncementRows } from "@/lib/school-admin/admin-feature-announcements";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/organizations/[id]/feature-announcements";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);
    const admin = createAdminClient();

    const { data: organization, error: organizationError } = await admin
      .from("organizations")
      .select("id")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      return apiError(ROUTE, {
        status: 500,
        error: organizationError.message,
        cause: organizationError,
      });
    }

    if (!organization) {
      return apiError(ROUTE, {
        status: 404,
        error: "Organization not found.",
        code: "organization_not_found",
      });
    }

    const [globals, overrides] = await Promise.all([
      listGlobalAdminFeatureAnnouncements(admin),
      listOrgAdminFeatureAnnouncements(admin, organizationId),
    ]);

    const effective = mergeAnnouncementRows(globals, overrides).filter(
      (row) => row.published,
    );

    return NextResponse.json({ globals, overrides, effective });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to load organization dashboard cards.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id: organizationId } = await context.params;

  try {
    await requirePlatformAdminUser(supabase);

    let body: Partial<AdminFeatureAnnouncementInput>;
    try {
      body = (await request.json()) as Partial<AdminFeatureAnnouncementInput>;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const required = [
      "announcementId",
      "title",
      "description",
      "ctaLabel",
      "featureKey",
      "hrefPath",
      "publishedAt",
    ] as const;

    for (const field of required) {
      if (!body[field]?.toString().trim()) {
        return apiError(ROUTE, {
          request,
          status: 400,
          error: `${field} is required.`,
          code: "missing_fields",
        });
      }
    }

    const admin = createAdminClient();

    const { data: organization, error: organizationError } = await admin
      .from("organizations")
      .select("id")
      .eq("id", organizationId)
      .maybeSingle();

    if (organizationError) {
      return apiError(ROUTE, {
        request,
        status: 500,
        error: organizationError.message,
        cause: organizationError,
      });
    }

    if (!organization) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Organization not found.",
        code: "organization_not_found",
      });
    }

    const announcement = await createAdminFeatureAnnouncement(admin, {
      organizationId,
      announcementId: body.announcementId!,
      title: body.title!,
      description: body.description!,
      ctaLabel: body.ctaLabel!,
      featureKey: body.featureKey!,
      hrefPath: body.hrefPath!,
      publishedAt: body.publishedAt!,
      published: body.published,
      sortOrder: body.sortOrder,
    });

    return NextResponse.json({ announcement });
  } catch (error) {
    if (error instanceof AuthError) {
      return apiError(ROUTE, {
        request,
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      request,
      status: 500,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create organization dashboard card override.",
      code: "internal_error",
      cause: error,
    });
  }
}
