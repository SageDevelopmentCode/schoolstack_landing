import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { FEATURE_SLUGS } from "@/lib/marketing/features";
import { FEATURES_PATH, featurePath } from "@/lib/marketing/features/paths";
import { FEATURES_CONTENT_UPDATED } from "@/lib/marketing/features/rivals";
import { COMPARE_PATH, COMPARE_RIVAL_IDS, comparePath } from "@/lib/marketing/compare";
import { listPublishedWebsiteBlogPostSlugs } from "@/lib/website-blog/storage";
import { createAdminClient } from "@/utils/supabase/admin";

const FEATURES_LAST_MODIFIED = new Date(FEATURES_CONTENT_UPDATED);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();
  const blogPosts = await listPublishedWebsiteBlogPostSlugs(admin);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}${FEATURES_PATH}`,
      lastModified: FEATURES_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    ...FEATURE_SLUGS.map((slug) => ({
      url: `${SITE_URL}${featurePath(slug)}`,
      lastModified: FEATURES_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    {
      url: `${SITE_URL}${COMPARE_PATH}`,
      lastModified: FEATURES_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...COMPARE_RIVAL_IDS.map((id) => ({
      url: `${SITE_URL}${comparePath(id)}`,
      lastModified: FEATURES_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    {
      url: `${SITE_URL}/get-started`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/microschool-ops-check`,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/how-many-students`,
      lastModified: new Date("2026-10-12"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/tuition-planner`,
      lastModified: new Date("2026-10-12"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: new Date("2026-10-15"),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.75,
    },
    {
      url: `${SITE_URL}/customers`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/customers/sagefield`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/demo-school`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/download`,
      lastModified: new Date("2026-10-19"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/support`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/account-deletion`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/dpa`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/subprocessors`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.65,
  }));

  return [...staticEntries, ...blogEntries];
}
