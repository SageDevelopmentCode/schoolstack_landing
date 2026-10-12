import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  deleteWebsiteBlogPost,
  getWebsiteBlogPostById,
  updateWebsiteBlogPost,
} from "@/lib/website-blog/storage";
import type { WebsiteBlogPostUpdateInput } from "@/lib/website-blog/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/website-blog-posts/[id]";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();
    const post = await getWebsiteBlogPostById(admin, id);
    if (!post) {
      return apiError(ROUTE, {
        request,
        status: 404,
        error: "Blog post not found.",
        code: "not_found",
      });
    }
    return NextResponse.json({ post });
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
      error: "Failed to load blog post.",
      code: "internal_error",
      cause: error,
    });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);

    let body: WebsiteBlogPostUpdateInput;
    try {
      body = (await request.json()) as WebsiteBlogPostUpdateInput;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const admin = createAdminClient();
    const post = await updateWebsiteBlogPost(admin, id, body);
    return NextResponse.json({ post });
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

    const message = error instanceof Error ? error.message : "Failed to update blog post.";
    return apiError(ROUTE, {
      request,
      status: 500,
      error: message,
      code: "internal_error",
      cause: error,
    });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { id } = await context.params;

  try {
    await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();
    await deleteWebsiteBlogPost(admin, id);
    return NextResponse.json({ ok: true });
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
      error: "Failed to delete blog post.",
      code: "internal_error",
      cause: error,
    });
  }
}
