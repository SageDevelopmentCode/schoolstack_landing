import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requirePlatformAdminUser } from "@/lib/admin/require-platform-admin-api";
import { AuthError } from "@/lib/admissions/application-auth";
import { apiError } from "@/lib/api/route-errors";
import {
  createWebsiteBlogPost,
  listWebsiteBlogPostsForAdmin,
} from "@/lib/website-blog/storage";
import type { WebsiteBlogPostInput } from "@/lib/website-blog/types";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const ROUTE = "/api/admin/website-blog-posts";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  try {
    await requirePlatformAdminUser(supabase, request);
    const admin = createAdminClient();
    const posts = await listWebsiteBlogPostsForAdmin(admin);
    return NextResponse.json({ posts });
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
      error: "Failed to load blog posts.",
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

    let body: Partial<WebsiteBlogPostInput>;
    try {
      body = (await request.json()) as Partial<WebsiteBlogPostInput>;
    } catch {
      return apiError(ROUTE, {
        request,
        status: 400,
        error: "Invalid request body.",
        code: "invalid_body",
      });
    }

    const required = ["slug", "title", "seoTitle", "metaDescription", "bodyHtml"] as const;
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
    const post = await createWebsiteBlogPost(admin, {
      slug: body.slug!,
      title: body.title!,
      seoTitle: body.seoTitle!,
      metaDescription: body.metaDescription!,
      primaryKeyword: body.primaryKeyword?.trim() ?? "",
      secondaryKeywords: body.secondaryKeywords ?? [],
      excerpt: body.excerpt ?? "",
      bodyHtml: body.bodyHtml!,
      published: body.published ?? false,
      publishedAt: body.publishedAt ?? null,
    });

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

    const message = error instanceof Error ? error.message : "Failed to create blog post.";
    return apiError(ROUTE, {
      request,
      status: 500,
      error: message,
      code: "internal_error",
      cause: error,
    });
  }
}
