import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeInView } from "@/components/ui/FadeInView";
import BlogPostFeatureTags from "@/components/blog/BlogPostFeatureTags";
import { getRepoBlogFeatureTags } from "@/content/blog/registry";
import { BOOK_DEMO_HREF } from "@/lib/marketing/book-demo";
import { ACCENT_HIGHLIGHT, BOLD_HEADING, DARK_PILL } from "@/components/home/bright-styles";
import type { WebsiteBlogPostPublic } from "@/lib/website-blog/types";

function formatPostDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type BlogBrightIndexProps = {
  posts: WebsiteBlogPostPublic[];
};

export default function BlogBrightIndex({ posts }: BlogBrightIndexProps) {
  return (
    <>
      <section className="bg-white px-3 pb-12 pt-28 md:pt-32 lg:px-6">
        <div className="mx-auto max-w-[1400px] px-3 md:px-6 lg:px-10">
          <FadeInView>
            <p className="font-secondary text-[13px] font-semibold uppercase tracking-widest text-clay">
              Blog
            </p>
          </FadeInView>
          <FadeInView delay={0.08}>
            <h1 className={`mt-5 max-w-[680px] text-[clamp(2rem,4.5vw,3.2rem)] ${BOLD_HEADING}`}>
              Insights for <span className={ACCENT_HIGHLIGHT}>microschool founders.</span>
            </h1>
          </FadeInView>
          <FadeInView delay={0.14}>
            <p className="mt-5 max-w-[520px] font-secondary text-[16px] leading-relaxed text-[#1d1a16]/70">
              Stories and practical ideas for launching, growing, and running a small school — or{" "}
              <Link href={BOOK_DEMO_HREF} className="font-semibold text-clay hover:underline">
                book a demo
              </Link>{" "}
              to talk with us.
            </p>
          </FadeInView>
        </div>
      </section>

      <section className="bg-white px-3 pb-20 lg:px-6">
        <div className="mx-auto max-w-[1400px] px-3 md:px-6 lg:px-10">
          {posts.length === 0 ? (
            <FadeInView delay={0.2}>
              <div className="mt-4 max-w-[520px] rounded-[28px] border border-black/8 bg-[#F7F5F2] px-6 py-10 text-center">
                <p className="font-secondary! text-lg font-bold! text-[#1d1a16]">No posts yet</p>
                <p className="mt-2 font-secondary text-sm leading-relaxed text-[#1d1a16]/65">
                  Check back soon for new writing from the MudKitchen team.
                </p>
                <Link
                  href={BOOK_DEMO_HREF}
                  className="mt-6 inline-flex items-center gap-1.5 font-secondary text-sm font-semibold text-clay hover:underline"
                >
                  See the product on the homepage
                </Link>
              </div>
            </FadeInView>
          ) : (
            <ul className="mt-4 grid max-w-[800px] gap-6">
              {posts.map((post, i) => {
                const dateLabel = formatPostDate(post.publishedAt);
                return (
                  <li key={post.slug}>
                    <FadeInView delay={i * 0.04}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group block rounded-[28px] border border-black/8 bg-white px-6 py-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(30,60,30,0.08)]"
                      >
                        {dateLabel ? (
                          <p className="font-secondary text-xs font-semibold uppercase tracking-widest text-[#1d1a16]/50">
                            {dateLabel}
                          </p>
                        ) : null}
                        <BlogPostFeatureTags
                          tags={getRepoBlogFeatureTags(post.slug)}
                          className="mt-3"
                        />
                        <h2 className="font-secondary! mt-2 text-xl font-bold! leading-snug tracking-[-0.02em]! text-[#1d1a16]">
                          {post.title}
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-3 font-secondary text-sm leading-relaxed text-[#1d1a16]/70">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <span
                          className={`${DARK_PILL} pointer-events-none mt-5 h-9 gap-1.5 px-5 text-sm`}
                        >
                          Read article
                          <ArrowRight size={14} aria-hidden />
                        </span>
                      </Link>
                    </FadeInView>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
