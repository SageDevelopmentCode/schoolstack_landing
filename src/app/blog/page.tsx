import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Badge } from "@/components/ui/Badge";
import { FadeInView } from "@/components/ui/FadeInView";
import { BOOK_DEMO_HREF } from "@/lib/marketing/book-demo";
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

function formatPostDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const admin = createAdminClient();
  const posts = await listPublishedWebsiteBlogPosts(admin);

  return (
    <>
      <BreadcrumbJsonLd items={BREADCRUMBS} />
      <Navbar />
      <main className="bg-bg min-h-screen">
        <section className="pt-[140px] pb-20">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-16">
            <FadeInView>
              <Badge>Blog</Badge>
            </FadeInView>
            <FadeInView delay={0.08}>
              <h1 className="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.05] text-text mt-5 max-w-[640px]">
                Insights for{" "}
                <em style={{ color: "#A05C45", fontStyle: "italic" }}>
                  microschool founders.
                </em>
              </h1>
            </FadeInView>
            <FadeInView delay={0.14}>
              <p className="text-[17px] font-secondary text-text-muted leading-relaxed mt-5 max-w-[520px]">
                Stories and practical ideas for launching, growing, and running a
                small school — or{" "}
                <Link href="/get-started" className="text-clay hover:underline">
                  book a demo
                </Link>{" "}
                to talk with us.
              </p>
            </FadeInView>

            {posts.length === 0 ? (
              <FadeInView delay={0.2}>
                <div
                  className="mt-12 max-w-[520px] rounded-2xl border border-black/[0.08] bg-white px-6 py-10 text-center"
                >
                  <p className="font-display text-lg text-text">No posts yet</p>
                  <p className="mt-2 text-sm font-secondary text-text-muted leading-relaxed">
                    Check back soon for new writing from the MudKitchen team.
                  </p>
                  <a
                    href={BOOK_DEMO_HREF}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-clay hover:underline font-secondary"
                  >
                    See the product on the homepage
                  </a>
                </div>
              </FadeInView>
            ) : (
              <ul className="mt-12 grid gap-6 max-w-[720px]">
                {posts.map((post) => {
                  const dateLabel = formatPostDate(post.publishedAt);
                  return (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="block rounded-2xl border border-black/[0.08] bg-white px-6 py-6 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                      >
                        {dateLabel ? (
                          <p className="text-xs font-semibold uppercase tracking-widest text-text-faint font-secondary">
                            {dateLabel}
                          </p>
                        ) : null}
                        <h2 className="font-display text-xl text-text mt-2 leading-snug">
                          {post.title}
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-3 text-sm font-secondary text-text-muted leading-relaxed">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <span className="mt-4 inline-flex text-sm font-medium text-clay font-secondary">
                          Read article →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
