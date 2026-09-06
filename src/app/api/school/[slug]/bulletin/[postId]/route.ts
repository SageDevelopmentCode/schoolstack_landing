import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  BulletinError,
  deleteBulletinPost,
  getBulletinPostForAdmin,
  updateBulletinPost,
} from "@/lib/school-bulletin/posts";
import type { BulletinAudience, BulletinPostStatus } from "@/lib/school-bulletin/types";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/bulletin/[postId]";

type RouteContext = {
  params: Promise<{ slug: string; postId: string }>;
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

type UpdateBulletinBody = {
  title?: string;
  body?: string;
  audiences?: BulletinAudience[];
  programIds?: string[];
  status?: BulletinPostStatus;
  publishedAt?: string | null;
  expiresAt?: string | null;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { slug, postId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    const admin = createAdminClient();
    const organizationId = await resolveOrganizationId(admin, slug);

    if (!organizationId) {
      return apiError(ROUTE, {
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, organizationId, request);
    const body = (await request.json()) as UpdateBulletinBody;

    const post = await updateBulletinPost(admin, {
      organizationId,
      postId,
      title: body.title,
      body: body.body,
      audiences: body.audiences,
      programIds: body.programIds,
      status: body.status,
      publishedAt: body.publishedAt,
      expiresAt: body.expiresAt,
    });

    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof BulletinError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to update bulletin post.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { slug, postId } = await context.params;
  const supabase = await createClientFromRequest(request);

  try {
    const admin = createAdminClient();
    const organizationId = await resolveOrganizationId(admin, slug);

    if (!organizationId) {
      return apiError(ROUTE, {
        status: 404,
        error: "School not found.",
        code: "not_found",
      });
    }

    await requireSchoolAdminUser(supabase, organizationId, request);

    const existing = await getBulletinPostForAdmin(admin, organizationId, postId);
    if (!existing) {
      return apiError(ROUTE, {
        status: 404,
        error: "Bulletin post not found.",
        code: "not_found",
      });
    }

    await deleteBulletinPost(admin, organizationId, postId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SchoolAdminAuthError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    if (error instanceof BulletinError) {
      return apiError(ROUTE, {
        status: error.status,
        error: error.message,
        code: error.code,
        cause: error,
      });
    }

    return apiError(ROUTE, {
      status: 500,
      error: "Failed to delete bulletin post.",
      code: "internal_error",
      cause: error,
    });
  }
}
