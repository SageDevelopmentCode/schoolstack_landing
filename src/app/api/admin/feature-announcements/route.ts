import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createAdminFeatureAnnouncement,
  listGlobalAdminFeatureAnnouncements,
  type AdminFeatureAnnouncementInput,
} from "@/lib/admin/admin-feature-announcements-storage";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/feature-announcements";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();
    const announcements = await listGlobalAdminFeatureAnnouncements(admin);
    return NextResponse.json({ announcements });
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
      error: "Failed to load global dashboard cards.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    await requirePlatformAdminUser(supabase, request);

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
    const announcement = await createAdminFeatureAnnouncement(admin, {
      organizationId: null,
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
      error: "Failed to create global dashboard card.",
      cause: error,
      code: "internal_error",
    });
  }
}
