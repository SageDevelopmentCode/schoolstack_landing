import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  BulletinError,
  createBulletinPost,
  listBulletinPostsForAdmin,
  listProgramsForBulletinPicker,
} from "@/lib/school-bulletin/posts";
import type { BulletinAudience, BulletinPostStatus } from "@/lib/school-bulletin/types";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { getStaffMemberIdForUser } from "@/lib/staff/teacher-portal-access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/bulletin";

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

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
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

    const [posts, programs] = await Promise.all([
      listBulletinPostsForAdmin(admin, organizationId),
      listProgramsForBulletinPicker(admin, organizationId),
    ]);

    return NextResponse.json({ posts, programs });
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
      error: "Failed to load bulletin posts.",
      code: "internal_error",
      cause: error,
    });
  }
}

type CreateBulletinBody = {
  title?: string;
  body?: string;
  audiences?: BulletinAudience[];
  programIds?: string[];
  status?: BulletinPostStatus;
  publishedAt?: string | null;
  expiresAt?: string | null;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
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

    const user = await requireSchoolAdminUser(supabase, organizationId, request);
    const body = (await request.json()) as CreateBulletinBody;
    const createdBy = await getStaffMemberIdForUser(admin, user.id, organizationId);

    const post = await createBulletinPost(admin, {
      organizationId,
      title: body.title?.trim() ?? "",
      body: body.body ?? "",
      audiences: body.audiences ?? ["school_wide"],
      programIds: body.programIds ?? [],
      status: body.status ?? "draft",
      publishedAt: body.publishedAt ?? null,
      expiresAt: body.expiresAt ?? null,
      createdBy,
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
      error: "Failed to create bulletin post.",
      code: "internal_error",
      cause: error,
    });
  }
}
