import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ArticleJsonLd from "@/components/seo/ArticleJsonLd";
import BlogGardenArticle from "@/components/blog/BlogGardenArticle";
import BlogPostHtml from "@/components/blog/BlogPostHtml";
import BlogPostProse from "@/components/blog/BlogPostProse";
import GardenRoot from "@/components/garden/GardenRoot";
import { getRepoBlogFeatureTags, getRepoBlogPost } from "@/content/blog/registry";
import { linkPreviewCard, linkPreviewImageUrl } from "@/lib/marketing/link-previews";
import { pageMetadata } from "@/lib/metadata";
import { buildBreadcrumbs } from "@/lib/seo";
import { WEBSITE_BLOG_AUTHOR } from "@/lib/website-blog/author";
import { sanitizeBlogHtml } from "@/lib/website-blog/sanitize-html";
import { getPublishedWebsiteBlogPostBySlug } from "@/lib/website-blog/storage";
import { createAdminClient } from "@/utils/supabase/admin";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function blogKeywords(post: {
  primaryKeyword: string;
  secondaryKeywords: string[];
}) {
  const keywords = [post.primaryKeyword, ...post.secondaryKeywords].filter(Boolean);
  return keywords.length ? keywords : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const post = await getPublishedWebsiteBlogPostBySlug(admin, slug);

  if (!post) {
    return pageMetadata({
      title: "Blog post not found",
      path: `/blog/${slug}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: post.seoTitle,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    keywords: blogKeywords(post),
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const admin = createAdminClient();
  const post = await getPublishedWebsiteBlogPostBySlug(admin, slug);

  if (!post) {
    notFound();
  }

  const repoPost = post.contentSource === "repo" ? getRepoBlogPost(slug) : null;
  if (post.contentSource === "repo" && !repoPost) {
    notFound();
  }

  const RepoContent = repoPost?.Content;
  const featureTags = getRepoBlogFeatureTags(slug);

  const breadcrumbs = buildBreadcrumbs(
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  );

  return (
    <GardenRoot>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ArticleJsonLd
        headline={post.seoTitle}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        image={linkPreviewImageUrl(linkPreviewCard(`/blog/${post.slug}`))}
        author={{
          name: WEBSITE_BLOG_AUTHOR.name,
          url: WEBSITE_BLOG_AUTHOR.profileUrl,
        }}
      />
      <BlogGardenArticle title={post.title} publishedAt={post.publishedAt} tags={featureTags}>
        {post.contentSource === "repo" && RepoContent ? (
          <BlogPostProse>
            <RepoContent />
          </BlogPostProse>
        ) : (
          <BlogPostHtml html={sanitizeBlogHtml(post.bodyHtml)} />
        )}
      </BlogGardenArticle>
    </GardenRoot>
  );
}
