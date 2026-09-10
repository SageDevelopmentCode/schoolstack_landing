import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createParentFeatureAnnouncement,
  listGlobalParentFeatureAnnouncements,
  type ParentFeatureAnnouncementInput,
} from "@/lib/admin/parent-feature-announcements-storage";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/parent-feature-announcements";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    await requirePlatformAdminUser(supabase);
    const admin = createAdminClient();
    const announcements = await listGlobalParentFeatureAnnouncements(admin);
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
      error: "Failed to load global parent portal cards.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    await requirePlatformAdminUser(supabase);

    let body: Partial<ParentFeatureAnnouncementInput>;
    try {
      body = (await request.json()) as Partial<ParentFeatureAnnouncementInput>;
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
    const announcement = await createParentFeatureAnnouncement(admin, {
      organizationId: null,
      announcementId: body.announcementId!,
      title: body.title!,
      description: body.description!,
      ctaLabel: body.ctaLabel!,
      featureKey: body.featureKey!,
      hrefPath: body.hrefPath!,
      portalScope: body.portalScope,
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
          : "Failed to create global parent portal card.",
      code: "internal_error",
      cause: error,
    });
  }
}
