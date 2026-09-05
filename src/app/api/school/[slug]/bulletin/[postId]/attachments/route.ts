import { NextResponse } from "next/server";
import { apiError } from "@/lib/api/route-errors";
import {
  assertAttachmentCapacity,
  deleteBulletinAttachment,
  getBulletinPostForAdmin,
  BulletinError,
} from "@/lib/school-bulletin/posts";
import {
  insertBulletinAttachments,
  uploadBulletinAttachment,
} from "@/lib/school-bulletin/attachment-storage";
import {
  requireSchoolAdminUser,
  SchoolAdminAuthError,
} from "@/lib/school-admin/access";
import { createClientFromRequest } from "@/lib/supabase/request-client";
import { createAdminClient } from "@/utils/supabase/admin";

const ROUTE = "/api/school/[slug]/bulletin/[postId]/attachments";

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

export async function POST(request: Request, context: RouteContext) {
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

    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      return apiError(ROUTE, {
        status: 400,
        error: "Choose at least one file to upload.",
        code: "invalid_request",
      });
    }

    await assertAttachmentCapacity(admin, organizationId, postId, files.length);

    const uploaded = [];
    for (const file of files) {
      uploaded.push(
        await uploadBulletinAttachment(admin, organizationId, postId, file),
      );
    }

    await insertBulletinAttachments(admin, organizationId, postId, uploaded);

    const post = await getBulletinPostForAdmin(admin, organizationId, postId);
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
      error: error instanceof Error ? error.message : "Failed to upload attachments.",
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

    const url = new URL(request.url);
    const attachmentId = url.searchParams.get("attachmentId")?.trim();
    if (!attachmentId) {
      return apiError(ROUTE, {
        status: 400,
        error: "Attachment id is required.",
        code: "invalid_request",
      });
    }

    const post = await deleteBulletinAttachment(
      admin,
      organizationId,
      postId,
      attachmentId,
    );

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
      error: "Failed to delete attachment.",
      code: "internal_error",
      cause: error,
    });
  }
}
