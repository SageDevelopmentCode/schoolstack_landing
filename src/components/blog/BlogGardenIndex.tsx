"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HomeGardenShell from "@/components/garden/HomeGardenShell";
import { Reveal, WordsReveal } from "@/components/garden/motion";
import { Draw, Leaf, Pill, Squiggle, Tape } from "@/components/garden/ui";
import { ILLUSTRATIONS, TAPES } from "@/components/home-garden/assets";
import BlogPostFeatureTags from "@/components/blog/BlogPostFeatureTags";
import type { BlogFeatureTagId } from "@/content/blog/blog-feature-tags";
import { GET_STARTED_PAGE_PATH } from "@/lib/marketing/book-demo";
import type { WebsiteBlogPostPublic } from "@/lib/website-blog/types";
import Image from "next/image";
import { BLOG_COPY, formatPostDate } from "./blog-copy";

export type BlogIndexPost = Pick<WebsiteBlogPostPublic, "slug" | "title" | "excerpt" | "publishedAt"> & {
  tags: BlogFeatureTagId[];
};

const CARD_TINTS = ["bg-white", "bg-[var(--sf-butter)]/60", "bg-[var(--sf-sky)]/70", "bg-[var(--sf-mint)]/70", "bg-[var(--sf-lav)]/70"] as const;
const CARD_TILTS = [-1.2, 1, -0.8, 1.3, -1];

const cardLink =
  "group relative block h-full rounded-[28px] border-2 border-[var(--sf-ink)] p-7 shadow-[0_6px_0_0_var(--sf-ink)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:!rotate-0 hover:-translate-y-1 hover:shadow-[0_10px_0_0_var(--sf-ink)] focus-visible:!rotate-0 focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30";

function ReadMore() {
  return (
    <span className="mt-6 inline-flex items-center gap-2 font-extrabold text-[var(--sf-clay-deep)]">
      {BLOG_COPY.readArticle}
      <ArrowRight size={17} strokeWidth={2.6} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
    </span>
  );
}

function FeaturedPost({ post }: { post: BlogIndexPost }) {
  const date = formatPostDate(post.publishedAt);
  return (
    <Link href={`/blog/${post.slug}`} className={`${cardLink} sf-paper p-8 sm:p-12`} style={{ rotate: "-0.6deg" }}>
      <Tape color="var(--sf-butter)" className="-top-3 left-14 w-24 -rotate-6" />
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_220px]">
        <div>
          {date ? <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--sf-clay-deep)]">{date}</p> : null}
          <BlogPostFeatureTags tags={post.tags} className="mt-4" />
          <h2 className="sf-display mt-5 text-4xl leading-[1.02] text-[var(--sf-ink)] md:text-5xl">{post.title}</h2>
          {post.excerpt ? <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--sf-ink)]/75">{post.excerpt}</p> : null}
          <ReadMore />
        </div>
        <div className="relative mx-auto hidden w-[200px] lg:block" aria-hidden="true">
          <Image src={ILLUSTRATIONS.letters} alt="" width={220} height={220} className="h-auto w-full -rotate-6 object-contain transition-transform duration-500 group-hover:rotate-0" />
        </div>
      </div>
    </Link>
  );
}

/** /blog in Garden: the newest post on notebook paper, the rest as tilted index cards. */
export default function BlogGardenIndex({ posts }: { posts: BlogIndexPost[] }) {
  const [featured, ...rest] = posts;

  return (
    <HomeGardenShell>
      <section aria-label={BLOG_COPY.eyebrow} className="sf-grid relative overflow-hidden pb-16 pt-32 lg:pb-20 lg:pt-40">
        <Draw className="absolute right-[10%] top-32 hidden w-14 lg:block" delay={0.8}>
          <Leaf />
        </Draw>
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          <Pill tint="forest">✏️ {BLOG_COPY.eyebrow}</Pill>
          <h1 className="sf-display mt-6 max-w-4xl text-[12vw] leading-[0.9] text-[var(--sf-ink)] sm:text-7xl lg:text-[5.6rem]">
            <WordsReveal as="span" text={BLOG_COPY.headlineLead} immediate />{" "}
            <span className="relative isolate inline-block text-[var(--sf-clay)]">
              <Draw className="pointer-events-none absolute -bottom-2 left-0 -z-10 w-full" delay={0.6}>
                <Squiggle className="h-5 w-full" color="var(--sf-butter)" />
              </Draw>
              <WordsReveal as="span" text={BLOG_COPY.headlineAccent} immediate delay={0.2} />
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-lg font-semibold leading-relaxed text-[var(--sf-soft)]">
            {BLOG_COPY.bodyBefore}
            <Link
              href={GET_STARTED_PAGE_PATH}
              className="rounded font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-moss)] decoration-2 underline-offset-4 hover:decoration-[var(--sf-clay)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
            >
              {BLOG_COPY.bodyLink}
            </Link>
            {BLOG_COPY.bodyAfter}
          </p>
        </div>
      </section>

      <section className="bg-[var(--sf-mint)]/40 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
          {!featured ? (
            <div className="relative mx-auto max-w-md rounded-md bg-[var(--sf-butter)] p-8 pt-10 text-center shadow-[0_14px_30px_-16px_rgba(43,36,29,0.5)]" style={{ rotate: "-1.5deg" }}>
              <Tape color="rgba(255,255,255,0.7)" className="-top-2.5 left-1/2 h-5 w-16 -translate-x-1/2 rotate-2" />
              <h2 className="sf-display text-3xl text-[var(--sf-ink)]">{BLOG_COPY.empty.title}</h2>
              <p className="mt-3 leading-relaxed text-[var(--sf-ink)]/75">{BLOG_COPY.empty.body}</p>
              <Link
                href={BLOG_COPY.empty.linkHref}
                className="mt-6 inline-flex rounded font-extrabold text-[var(--sf-clay-deep)] underline decoration-[var(--sf-clay)]/40 decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--sf-clay)]/30"
              >
                {BLOG_COPY.empty.link}
              </Link>
            </div>
          ) : (
            <>
              <Reveal y={50}>
                <FeaturedPost post={featured} />
              </Reveal>
              {rest.length ? (
                <Reveal as="ul" className="mt-14 grid gap-8 md:grid-cols-2" y={40} stagger={0.08}>
                  {rest.map((post, i) => {
                    const date = formatPostDate(post.publishedAt);
                    return (
                      <li key={post.slug} className="relative">
                        <Tape color={TAPES[i % TAPES.length]} className="-top-3 left-1/2 -translate-x-1/2 -rotate-3" />
                        <Link href={`/blog/${post.slug}`} className={`${cardLink} ${CARD_TINTS[(i + 1) % CARD_TINTS.length]}`} style={{ rotate: `${CARD_TILTS[i % CARD_TILTS.length]}deg` }}>
                          {date ? <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--sf-soft)]">{date}</p> : null}
                          <BlogPostFeatureTags tags={post.tags} className="mt-3" />
                          <h3 className="sf-display mt-4 text-3xl leading-[1.05] text-[var(--sf-ink)]">{post.title}</h3>
                          {post.excerpt ? <p className="mt-3 leading-relaxed text-[var(--sf-ink)]/75">{post.excerpt}</p> : null}
                          <ReadMore />
                        </Link>
                      </li>
                    );
                  })}
                </Reveal>
              ) : null}
            </>
          )}
        </div>
      </section>
    </HomeGardenShell>
  );
}
