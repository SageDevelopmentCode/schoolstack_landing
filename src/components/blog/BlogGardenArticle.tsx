import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Tape, btnPop } from "@/components/garden/ui";
import BlogPostByline from "@/components/blog/BlogPostByline";
import BlogPostFeatureTags from "@/components/blog/BlogPostFeatureTags";
import type { BlogFeatureTagId } from "@/content/blog/blog-feature-tags";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import { BLOG_COPY, formatPostDate } from "./blog-copy";

const backLink =
  "inline-flex items-center gap-1.5 rounded-full text-sm font-extrabold text-[var(--sf-clay-deep)] transition-colors hover:text-[var(--sf-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

/**
 * A blog post in calm Garden: reading comes first. Header on dot-grid paper,
 * the body in `.sf-prose`, then a paper "book a demo" card.
 */
export default function BlogGardenArticle({
  title,
  publishedAt,
  tags,
  children,
}: {
  title: string;
  publishedAt: string | null;
  tags: BlogFeatureTagId[];
  /** The post body, already wrapped in BlogPostProse or BlogPostHtml. */
  children: ReactNode;
}) {
  const date = formatPostDate(publishedAt);

  return (
    <HomeGardenShell>
      <article>
        <header className="sf-grid pb-12 pt-32 lg:pb-16 lg:pt-40">
          <div className="mx-auto max-w-[760px] px-6 sm:px-10">
            <Link href="/blog" className={backLink}>
              <ArrowLeft size={16} strokeWidth={2.6} aria-hidden />
              {BLOG_COPY.backToBlog}
            </Link>
            {date ? <p className="mt-8 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--sf-clay-deep)]">{date}</p> : null}
            <BlogPostFeatureTags tags={tags} className="mt-4" />
            <h1 className="sf-display mt-5 text-[clamp(2.4rem,6vw,4rem)] leading-[0.98] text-[var(--sf-ink)]">{title}</h1>
            <BlogPostByline className="mt-7" />
          </div>
        </header>

        <div className="border-t-2 border-dashed border-[var(--sf-ink)]/10 bg-[var(--sf-paper)] pb-24 pt-14 lg:pb-32 lg:pt-16">
          <div className="mx-auto max-w-[720px] px-6 sm:px-10">{children}</div>

          <div className="mx-auto mt-20 max-w-[720px] px-6 sm:px-10">
            <div className="sf-paper relative rounded-[30px] border-2 border-[var(--sf-ink)] p-8 text-center shadow-[0_8px_0_0_var(--sf-ink)] sm:p-10" style={{ rotate: "-0.8deg" }}>
              <Tape color="var(--sf-peach)" className="-top-3 left-12 w-24 -rotate-6" />
              <Tape color="var(--sf-mint)" className="-top-3 right-12 w-24 rotate-6" />
              <p className="sf-hand text-2xl text-[var(--sf-forest)]" aria-hidden="true">
                thanks for reading ✿
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-5 sm:flex-row">
                <Link href={GET_STARTED_PAGE_PATH} className={btnPop}>
                  {BLOG_COPY.bookDemo}
                  <ArrowRight size={18} strokeWidth={2.6} aria-hidden />
                </Link>
                <Link href="/blog" className={backLink}>
                  <ArrowLeft size={16} strokeWidth={2.6} aria-hidden />
                  {BLOG_COPY.allPosts}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </HomeGardenShell>
  );
}
