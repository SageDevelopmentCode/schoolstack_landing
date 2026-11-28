import { buildLlmsTxt } from "@/lib/llms-txt";
import { listPublishedWebsiteBlogPosts } from "@/lib/website-blog/storage";
import { createAdminClient } from "@/utils/supabase/admin";

export const revalidate = 3600;

/** /llms.txt: plain-text site map for AI assistants (see src/lib/llms-txt.ts). */
export async function GET() {
  const posts = await listPublishedWebsiteBlogPosts(createAdminClient());
  const body = buildLlmsTxt({ blogPosts: posts.map((p) => ({ slug: p.slug, title: p.title })) });
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
