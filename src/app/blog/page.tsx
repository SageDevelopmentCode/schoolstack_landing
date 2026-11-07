import type { Metadata } from "next";
import HomeShell from "@/components/home/HomeShell";
import BlogBrightIndex from "@/components/blog/BlogBrightIndex";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";
import { listPublishedWebsiteBlogPosts } from "@/lib/website-blog/storage";
import { createAdminClient } from "@/utils/supabase/admin";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Stories, ideas, and product updates for microschool founders and operators from the MudKitchen team.",
  path: "/blog",
});

export const revalidate = 300;

const BREADCRUMBS = buildBreadcrumbs({ name: "Blog", path: "/blog" });

export default async function BlogPage() {
  const admin = createAdminClient();
  const posts = await listPublishedWebsiteBlogPosts(admin);

  return (
    <HomeShell className="bg-white">
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <BlogBrightIndex posts={posts} />
    </HomeShell>
  );
}
