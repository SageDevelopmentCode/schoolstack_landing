import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeBlogHtml } from "@/lib/website-blog/sanitize-html";
import { normalizeBlogSlug, parseSecondaryKeywords } from "@/lib/website-blog/slug";
import type {
  WebsiteBlogPostInput,
  WebsiteBlogPostListItem,
  WebsiteBlogPostPublic,
  WebsiteBlogPostRecord,
  WebsiteBlogPostUpdateInput,
} from "@/lib/website-blog/types";

type WebsiteBlogPostRow = {
  id: string;
  slug: string;
  title: string;
  seo_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[] | null;
  excerpt: string;
  body_html: string;
  content_source?: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: WebsiteBlogPostRow): WebsiteBlogPostRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title,
    metaDescription: row.meta_description,
    primaryKeyword: row.primary_keyword,
    secondaryKeywords: row.secondary_keywords ?? [],
    excerpt: row.excerpt,
    bodyHtml: row.body_html,
    contentSource: row.content_source === "repo" ? "repo" : "html",
    published: row.published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPublic(row: WebsiteBlogPostRow): WebsiteBlogPostPublic {
  const mapped = mapRow(row);
  return {
    slug: mapped.slug,
    title: mapped.title,
    seoTitle: mapped.seoTitle,
    metaDescription: mapped.metaDescription,
    primaryKeyword: mapped.primaryKeyword,
    secondaryKeywords: mapped.secondaryKeywords,
    excerpt: mapped.excerpt,
    bodyHtml: mapped.bodyHtml,
    contentSource: mapped.contentSource,
    publishedAt: mapped.publishedAt,
  };
}

function normalizeInput(input: WebsiteBlogPostInput): WebsiteBlogPostInput {
  const slug = normalizeBlogSlug(input.slug);
  const published = input.published ?? false;
  const publishedAt = published
    ? input.publishedAt?.trim()
      ? input.publishedAt
      : new Date().toISOString()
    : null;

  return {
    slug,
    title: input.title.trim(),
    seoTitle: input.seoTitle.trim(),
    metaDescription: input.metaDescription.trim(),
    primaryKeyword: input.primaryKeyword.trim(),
    secondaryKeywords: input.secondaryKeywords.map((k) => k.trim()).filter(Boolean),
    excerpt: (input.excerpt ?? "").trim(),
    bodyHtml: sanitizeBlogHtml(input.bodyHtml),
    published,
    publishedAt: published ? publishedAt : null,
  };
}

function rowFromInput(input: WebsiteBlogPostInput) {
  const normalized = normalizeInput(input);
  return {
    slug: normalized.slug,
    title: normalized.title,
    seo_title: normalized.seoTitle,
    meta_description: normalized.metaDescription,
    primary_keyword: normalized.primaryKeyword,
    secondary_keywords: normalized.secondaryKeywords,
    excerpt: normalized.excerpt,
    body_html: normalized.bodyHtml,
    published: normalized.published ?? false,
    published_at: normalized.publishedAt,
  };
}

export async function listPublishedWebsiteBlogPosts(
  supabase: SupabaseClient,
): Promise<WebsiteBlogPostPublic[]> {
  const { data, error } = await supabase
    .from("website_blog_posts")
    .select(
      "slug, title, seo_title, meta_description, primary_keyword, secondary_keywords, excerpt, body_html, content_source, published_at",
    )
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error || !data) return [];
  return (data as WebsiteBlogPostRow[]).map(toPublic);
}

export async function listPublishedWebsiteBlogPostSlugs(
  supabase: SupabaseClient,
): Promise<{ slug: string; updatedAt: string }[]> {
  const { data, error } = await supabase
    .from("website_blog_posts")
    .select("slug, updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error || !data) return [];
  return data.map((row) => ({
    slug: row.slug as string,
    updatedAt: row.updated_at as string,
  }));
}

export async function getPublishedWebsiteBlogPostBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<WebsiteBlogPostPublic | null> {
  const normalized = normalizeBlogSlug(slug);
  const { data, error } = await supabase
    .from("website_blog_posts")
    .select(
      "slug, title, seo_title, meta_description, primary_keyword, secondary_keywords, excerpt, body_html, content_source, published_at",
    )
    .eq("slug", normalized)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return toPublic(data as WebsiteBlogPostRow);
}

export async function listWebsiteBlogPostsForAdmin(
  supabase: SupabaseClient,
): Promise<WebsiteBlogPostListItem[]> {
  const { data, error } = await supabase
    .from("website_blog_posts")
    .select("id, slug, title, excerpt, published, published_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return (data as WebsiteBlogPostRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    published: row.published,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  }));
}

export async function getWebsiteBlogPostById(
  supabase: SupabaseClient,
  id: string,
): Promise<WebsiteBlogPostRecord | null> {
  const { data, error } = await supabase
    .from("website_blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as WebsiteBlogPostRow);
}

export async function createWebsiteBlogPost(
  supabase: SupabaseClient,
  input: WebsiteBlogPostInput,
): Promise<WebsiteBlogPostRecord> {
  const payload = rowFromInput(input);
  const { data, error } = await supabase
    .from("website_blog_posts")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create blog post.");
  }

  return mapRow(data as WebsiteBlogPostRow);
}

export async function updateWebsiteBlogPost(
  supabase: SupabaseClient,
  id: string,
  input: WebsiteBlogPostUpdateInput,
): Promise<WebsiteBlogPostRecord> {
  const existing = await getWebsiteBlogPostById(supabase, id);
  if (!existing) {
    throw new Error("Blog post not found.");
  }

  const merged: WebsiteBlogPostInput = {
    slug: input.slug ?? existing.slug,
    title: input.title ?? existing.title,
    seoTitle: input.seoTitle ?? existing.seoTitle,
    metaDescription: input.metaDescription ?? existing.metaDescription,
    primaryKeyword: input.primaryKeyword ?? existing.primaryKeyword,
    secondaryKeywords: input.secondaryKeywords ?? existing.secondaryKeywords,
    excerpt: input.excerpt ?? existing.excerpt,
    bodyHtml:
      existing.contentSource === "repo"
        ? existing.bodyHtml
        : (input.bodyHtml ?? existing.bodyHtml),
    published: input.published ?? existing.published,
    publishedAt:
      input.publishedAt !== undefined ? input.publishedAt : existing.publishedAt,
  };

  const payload = rowFromInput(merged);
  const { data, error } = await supabase
    .from("website_blog_posts")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to update blog post.");
  }

  return mapRow(data as WebsiteBlogPostRow);
}

export async function deleteWebsiteBlogPost(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("website_blog_posts").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

export { parseSecondaryKeywords };
