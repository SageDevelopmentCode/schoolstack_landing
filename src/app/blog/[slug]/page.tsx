import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import ArticleJsonLd from "@/components/seo/ArticleJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import BlogPostByline from "@/components/blog/BlogPostByline";
import BlogPostHtml from "@/components/blog/BlogPostHtml";
import BlogPostProse from "@/components/blog/BlogPostProse";
import { getRepoBlogPost } from "@/content/blog/registry";
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

  const breadcrumbs = buildBreadcrumbs(
    { name: "Blog", path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` },
  );

  const publishedLabel = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ArticleJsonLd
        headline={post.seoTitle}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        image="/opengraph-image"
        author={{
          name: WEBSITE_BLOG_AUTHOR.name,
          url: WEBSITE_BLOG_AUTHOR.profileUrl,
        }}
      />
      <Navbar />
      <main className="bg-bg min-h-screen">
        <article className="pt-[140px] pb-20">
          <div className="max-w-[720px] mx-auto px-6 lg:px-16">
            {publishedLabel ? (
              <p className="text-xs font-semibold uppercase tracking-widest text-text-faint font-secondary">
                {publishedLabel}
              </p>
            ) : null}
            <h1 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.1] text-text mt-4">
              {post.title}
            </h1>
            <BlogPostByline />
            <div className="mt-10">
              {post.contentSource === "repo" && RepoContent ? (
                <BlogPostProse>
                  <RepoContent />
                </BlogPostProse>
              ) : (
                <BlogPostHtml html={sanitizeBlogHtml(post.bodyHtml)} />
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
