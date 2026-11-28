"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GardenRoot from "@/components/garden/GardenRoot";
import BlogDemo from "@/components/blog/demos/BlogDemo";
import BlogShot from "@/components/blog/demos/BlogShot";
import BlogToolCallout from "@/components/blog/demos/BlogToolCallout";
import { G_FOCUS, gLinkSm } from "@/components/school-parent/garden/ui";
import { AdminGardenPage } from "@/components/school-admin/garden/kit";
import {
  BLOG_DEMO_IDS,
  BLOG_DEMOS,
  BLOG_TOOLS,
  type BlogShotSrc,
  type BlogToolId,
} from "@/lib/marketing/blog-demos";
import { BLOG_TOPICS } from "@/lib/marketing/blog-topics";
import { MUDKITCHEN_ADMIN_GARDEN_THEME as THEME } from "@/components/admin/garden/theme";
import { MarketingGardenHeader } from "@/components/admin/marketing/garden/MarketingGardenHeader";
import { CopyChip } from "@/components/admin/marketing/garden/marketing-ui";

/** Every screenshot the topics plan to use, once each. */
const PLANNED_SHOTS: BlogShotSrc[] = [
  ...new Set(
    BLOG_TOPICS.flatMap((topic) => topic.embeds).flatMap((embed) =>
      embed.kind === "shot"
        ? Array.isArray(embed.src)
          ? embed.src
          : [embed.src]
        : [],
    ),
  ),
].sort();

function usedBy(match: (topicEmbeds: BlogTopicEmbedLike) => boolean) {
  return BLOG_TOPICS.filter((topic) => topic.embeds.some(match)).length;
}
type BlogTopicEmbedLike = (typeof BLOG_TOPICS)[number]["embeds"][number];

const JUMP_PILL = `inline-flex min-h-[32px] items-center rounded-full border-[1.5px] px-3 py-1 text-[12.5px] font-extrabold transition-colors ${G_FOCUS}`;

/**
 * Admin check for the blog embed kit: every live demo, planned screenshot and tool card,
 * rendered through the same components a post uses.
 */
export default function BlogDemoGallery() {
  return (
    <AdminGardenPage
      theme={THEME}
      data-testid="marketing-blog-demos"
      containerClassName="!max-w-[1320px]"
    >
      <MarketingGardenHeader
        kicker={
          <Link
            href="/admin/marketing/blog-topics"
            className={`${gLinkSm} !text-[11px] !uppercase !tracking-[0.18em]`}
          >
            <ArrowLeft className="h-3 w-3" aria-hidden />
            Blog topics
          </Link>
        }
        title={
          <>
            Blog <span className="text-[var(--sf-clay)]">demos</span>
          </>
        }
        subtitle={`${BLOG_DEMO_IDS.length} live demos · ${PLANNED_SHOTS.length} screenshots · ${Object.keys(BLOG_TOOLS).length} tool cards`}
      />

      <p className="m-0 max-w-3xl text-[14px] font-semibold leading-relaxed text-[var(--sf-soft)]">
        Exactly what readers see in a post. Live demos load as they scroll into
        view and run on the Luff Learning demo data (no login, no network).
        Paste the snippet into a post in src/content/blog/posts/.
      </p>

      <nav aria-label="Jump to a demo" className="flex flex-wrap gap-1.5">
        {BLOG_DEMO_IDS.map((id) => (
          <a
            key={id}
            href={`#demo-${id}`}
            className={`${JUMP_PILL} border-[var(--sf-ink)]/15 bg-white text-[var(--sf-ink)]/80 hover:border-[var(--sf-ink)]/40 hover:text-[var(--sf-ink)]`}
          >
            {BLOG_DEMOS[id].label}
          </a>
        ))}
        <a
          href="#shots"
          className={`${JUMP_PILL} border-[#d9a400]/35 bg-[var(--sf-butter)] text-[var(--sf-ink)]`}
        >
          Screenshots ({PLANNED_SHOTS.length})
        </a>
        <a
          href="#tools"
          className={`${JUMP_PILL} border-[var(--sf-forest)]/25 bg-[var(--sf-mint)] text-[var(--sf-ink)]`}
        >
          Tool cards
        </a>
      </nav>

      {/* The embeds render through GardenRoot, as they do inside a post. `data-family-preview`
          opts them out of the admin skin's input and small-type rules, so they look exactly like a post. */}
      <div data-family-preview>
        <GardenRoot className="-mx-4 rounded-[28px] pb-12 sm:mx-0">
          {BLOG_DEMO_IDS.map((id) => (
            <section
              key={id}
              id={`demo-${id}`}
              className="scroll-mt-6 border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-10"
            >
              <GalleryHeading
                title={BLOG_DEMOS[id].label}
                meta={`${BLOG_DEMOS[id].view} view · ${BLOG_DEMOS[id].interactive ? "clickable" : "still"} · used by ${usedBy((e) => e.kind === "demo" && e.id === id)} topics`}
                snippet={`<BlogDemo id="${id}" caption="…" />`}
              />
              <BlogDemo id={id} caption={`Caption goes here (${id})`} />
            </section>
          ))}

          <section id="shots" className="scroll-mt-6 pt-12">
            <GalleryHeading
              title="Screenshots"
              meta="From the /features pages; for features with no live demo"
              snippet={`<BlogShot src="feature/web-…" caption="…" />`}
            />
            {PLANNED_SHOTS.map((src) => (
              <div
                key={src}
                className="border-b-[1.5px] border-dashed border-[var(--sf-ink)]/12 pt-6"
              >
                <p className="mx-auto max-w-6xl px-6 font-mono text-xs text-[var(--sf-soft)]">
                  {src}
                </p>
                <BlogShot src={src} />
              </div>
            ))}
          </section>

          <section id="tools" className="scroll-mt-6 pt-12">
            <GalleryHeading
              title="Tool cards"
              meta="Free tools, as a card inside a post"
              snippet={`<BlogToolCallout tool="tuition-planner" />`}
            />
            <div className="mx-auto max-w-[720px] px-6">
              {(Object.keys(BLOG_TOOLS) as BlogToolId[]).map((id) => (
                <BlogToolCallout key={id} tool={id} />
              ))}
            </div>
          </section>
        </GardenRoot>
      </div>
    </AdminGardenPage>
  );
}

function GalleryHeading({
  title,
  meta,
  snippet,
}: {
  title: string;
  meta: string;
  snippet: string;
}) {
  return (
    <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-3 px-6">
      <div className="min-w-0">
        <h2 className="sf-display m-0 text-[1.5rem] leading-[1.05] text-[var(--sf-ink)]">
          {title}
        </h2>
        <p className="m-0 mt-1 text-[13px] font-semibold text-[var(--sf-soft)]">
          {meta}
        </p>
        <code className="mt-1.5 block font-mono text-xs text-[var(--sf-forest)]">
          {snippet}
        </code>
      </div>
      <CopyChip text={snippet} label="Copy snippet" what="Snippet" />
    </div>
  );
}
