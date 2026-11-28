import type { Metadata } from "next";
import BlogGardenIndex from "@/components/blog/BlogGardenIndex";
import GardenRoot from "@/components/garden/GardenRoot";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { getRepoBlogFeatureTags } from "@/content/blog/registry";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";
import { listPublishedWebsiteBlogPosts } from "@/lib/website-blog/storage";
import { createAdminClient } from "@/utils/supabase/admin";

export const metadata: Metadata = pageMetadata({
  title: "Microschool blog for founders",
  description:
    "Stories, ideas, and product updates for microschool founders and operators from the MudKitchen team.",
  path: "/blog",
});

export const revalidate = 300;

const BREADCRUMBS = buildBreadcrumbs({ name: "Blog", path: "/blog" });

export default async function BlogPage() {
  const admin = createAdminClient();
  const posts = await listPublishedWebsiteBlogPosts(admin);
  // Only what the cards show goes to the client (not the post bodies).
  const cards = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    publishedAt: p.publishedAt,
    tags: getRepoBlogFeatureTags(p.slug),
  }));

  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <BlogGardenIndex posts={cards} />
    </GardenRoot>
  );
}
