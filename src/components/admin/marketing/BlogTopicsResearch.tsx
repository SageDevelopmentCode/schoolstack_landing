"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronDown, ExternalLink } from "lucide-react";
import { GChip, G_FOCUS, GTabBar, gBtnOutlineSm, gLinkSm, type GChipTone } from "@/components/school-parent/garden/ui";
import {
  AdminGardenPage,
  GardenFilterChips,
  GardenNotice,
  GardenSelect,
  GardenStatTiles,
  ROW_INTERACTIVE,
  type GardenStat,
} from "@/components/school-admin/garden/kit";
import { GardenFacts, GardenGroupHeading } from "@/components/school-admin/garden/blocks";
import { GSearchInput } from "@/components/school-parent/garden/fields";
import {
  BLOG_TOPIC_CLUSTERS,
  BLOG_TOPICS,
  BLOG_TOPICS_RESEARCHED,
  type BlogTopic,
  type BlogTopicEmbed,
  type BlogTopicFunnel,
  type BlogTopicPriority,
} from "@/lib/marketing/blog-topics";
import { MUDKITCHEN_ADMIN_GARDEN_THEME as THEME } from "@/components/admin/garden/theme";
import { MarketingGardenHeader } from "@/components/admin/marketing/garden/MarketingGardenHeader";
import { CopyChip, MetaChip } from "@/components/admin/marketing/garden/marketing-ui";
import {
  CLUSTER_LABEL,
  embedCount,
  embedSnippet,
  embedTitle,
  formatDate,
  FUNNEL_LABEL,
  shortDate,
  STATUS_LABEL,
  topicBrief,
  UP_NEXT_DAYS,
  VOLUME_LABEL,
  type TopicStatus,
} from "@/components/admin/marketing/blog-topics-ui";
import { useBlogTopicsModel } from "@/components/admin/marketing/useBlogTopicsModel";

const STATUS_TONE: Record<TopicStatus, GChipTone> = { idea: "neutral", draft: "info", published: "success" };
const STATUS_ACCENT: Record<TopicStatus, GardenStat["accent"]> = { idea: "gold", draft: "sky", published: "forest" };
const EMBED_KIND: Record<BlogTopicEmbed["kind"], { label: string; tone: GChipTone }> = {
  demo: { label: "Live demo", tone: "success" },
  shot: { label: "Screenshot", tone: "info" },
  tool: { label: "Free tool", tone: "neutral" },
  "capture-needed": { label: "Needs capture", tone: "warning" },
};
const PRIORITY_CLASS: Record<BlogTopicPriority, string> = {
  1: "border-[var(--sf-ink)] bg-[var(--sf-clay)] text-white",
  2: "border-[var(--sf-clay)]/25 bg-[var(--sf-peach)] text-[var(--sf-clay-deep)]",
  3: "border-transparent bg-[var(--sf-ink)]/[0.06] text-[var(--sf-ink)]/70",
};

function PriorityChip({ priority }: { priority: BlogTopicPriority }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border-[1.5px] px-2 py-0.5 text-[11.5px] font-extrabold tabular-nums ${PRIORITY_CLASS[priority]}`}>
      P{priority}
    </span>
  );
}

/** /admin/marketing/blog-topics: researched SEO topics, their schedule and what goes in each post. */
export default function BlogTopicsResearch() {
  const model = useBlogTopicsModel();
  const counts = model.statusCounts;
  const loaded = model.posts != null;
  const subtitle = loaded
    ? `${BLOG_TOPICS.length} researched · ${counts.published} published · ${counts.draft} ${counts.draft === 1 ? "draft" : "drafts"}`
    : `${BLOG_TOPICS.length} researched ideas`;

  return (
    <AdminGardenPage theme={THEME} data-testid="marketing-blog-topics">
      <MarketingGardenHeader
        title={
          <>
            Blog <span className="text-[var(--sf-clay)]">topics</span>
          </>
        }
        subtitle={subtitle}
        actions={
          <Link href="/admin/marketing/blog-topics/demos" className={gBtnOutlineSm}>
            See every demo <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />

      <GardenNotice tone="info" title="SEO-first topics for microschool, small-school and co-op founders, each tied to a feature and a signup CTA.">
        Researched {BLOG_TOPICS_RESEARCHED}. Search volumes are estimates; confirm in Search Console before writing. Status comes from the
        Blog tab: a post with the topic&apos;s slug. Each topic lists the product demos to put in the post.
      </GardenNotice>

      {model.loadError ? (
        <GardenNotice
          tone="warning"
          role="alert"
          title="Couldn't load blog posts."
          action={
            <button type="button" className={gBtnOutlineSm} onClick={model.retry} disabled={model.loading}>
              {model.loading ? "Trying again…" : "Try again"}
            </button>
          }
        >
          {model.loadError} Topics still show; statuses read as Not started until this loads.
        </GardenNotice>
      ) : null}

      <GardenStatTiles
        layout="strip"
        ariaLabel="Topics by status"
        stats={(Object.keys(STATUS_LABEL) as TopicStatus[]).map((key) => ({
          id: key,
          label: STATUS_LABEL[key],
          value: loaded ? counts[key] : "–",
          accent: STATUS_ACCENT[key],
          onClick: () => model.setStatus(model.status === key ? "all" : key),
          active: model.status === key,
          testId: `marketing-topics-stat-${key}`,
        }))}
      />

      {model.upNext.length ? (
        <section
          aria-labelledby="up-next-title"
          className="rounded-[24px] border-[1.5px] border-[var(--sf-ink)]/12 bg-white p-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-5"
        >
          <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--sf-soft)]">
            Next {UP_NEXT_DAYS / 7} weeks · every priority
          </p>
          <h2 id="up-next-title" className="sf-display m-0 mt-1 text-[1.4rem] leading-[1.05] text-[var(--sf-ink)]">
            Up next
          </h2>
          <ol className="m-0 mt-3 flex list-none flex-col gap-0.5 p-0">
            {model.upNext.map((topic, index) => {
              const behind = model.today != null && topic.scheduledFor < model.today;
              return (
                <li key={topic.id}>
                  <button type="button" onClick={() => model.openTopic(topic.id)} className={`${ROW_INTERACTIVE} !py-2.5`}>
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--sf-ink)]/15 bg-[var(--sf-paper)] text-[12px] font-extrabold tabular-nums text-[var(--sf-ink)]/70 max-sm:hidden"
                    >
                      {index + 1}
                    </span>
                    <span className="w-[76px] shrink-0 text-[12.5px] font-extrabold tabular-nums text-[var(--sf-soft)] sm:w-[92px]">
                      {shortDate(topic.scheduledFor)}
                    </span>
                    <PriorityChip priority={topic.priority} />
                    <span className="min-w-0 flex-1 truncate text-[14px] font-extrabold text-[var(--sf-ink)]">{topic.workingTitle}</span>
                    {behind ? <GChip tone="alert">Behind</GChip> : null}
                    <GChip tone={STATUS_TONE[model.statusOf(topic)]} className="max-sm:hidden">
                      {STATUS_LABEL[model.statusOf(topic)]}
                    </GChip>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--sf-ink)]/30 group-hover:text-[var(--sf-clay-deep)] max-sm:hidden" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}

      <section aria-label="Filters" className="flex flex-col gap-3">
        <GardenFilterChips
          ariaLabel="Filter by cluster"
          value={model.cluster}
          onChange={(key) => model.setCluster(key as typeof model.cluster)}
          options={[
            { key: "all", label: "All", count: BLOG_TOPICS.length },
            ...BLOG_TOPIC_CLUSTERS.map((c) => ({
              key: c.id,
              label: c.label,
              count: BLOG_TOPICS.filter((t) => t.cluster === c.id).length,
            })).filter((option) => option.count > 0),
          ]}
        />
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center">
          <GSearchInput value={model.query} onChange={model.setQuery} placeholder="Search titles, keywords, features" label="Search topics" />
          <GardenSelect
            aria-label="Funnel"
            value={model.funnel}
            onChange={(v) => model.setFunnel(v as BlogTopicFunnel | "all")}
            options={[{ value: "all", label: "Any funnel" }, ...Object.entries(FUNNEL_LABEL).map(([value, label]) => ({ value, label }))]}
          />
          <GardenSelect
            aria-label="Priority"
            value={String(model.priority)}
            onChange={(v) => model.setPriority(v === "all" ? "all" : (Number(v) as BlogTopicPriority))}
            options={[
              { value: "all", label: "Any priority" },
              { value: "1", label: "P1" },
              { value: "2", label: "P2" },
              { value: "3", label: "P3" },
            ]}
          />
          <GardenSelect
            aria-label="Status"
            value={model.status}
            onChange={(v) => model.setStatus(v as TopicStatus | "all")}
            options={[{ value: "all", label: "Any status" }, ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-[13px] font-bold text-[var(--sf-soft)]" aria-live="polite">
            <span className="tabular-nums">
              {model.filtered.length} of {BLOG_TOPICS.length}
            </span>{" "}
            topics · {model.view === "schedule" ? "by publish date, Tuesdays and Thursdays" : "sorted by priority, then publish date"}
            {model.filtersActive ? (
              <>
                {" · "}
                <button type="button" onClick={model.clearFilters} className={gLinkSm}>
                  Clear filters
                </button>
              </>
            ) : null}
          </p>
          <GTabBar
            ariaLabel="View"
            activeKey={model.view}
            onChange={(key) => model.setView(key as typeof model.view)}
            items={[
              { key: "schedule", label: "Schedule" },
              { key: "list", label: "List" },
            ]}
          />
        </div>
      </section>

      {!model.filtered.length ? (
        <div className="rounded-[16px] bg-[var(--sf-paper)] p-4 text-[13.5px] font-semibold text-[var(--sf-soft)]">
          No topics match these filters.{" "}
          <button type="button" className={gLinkSm} onClick={model.clearFilters}>
            Show every topic
          </button>
        </div>
      ) : model.view === "list" ? (
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {model.filtered.map((topic) => (
            <TopicRow key={topic.id} topic={topic} model={model} />
          ))}
        </ol>
      ) : (
        <div className="flex flex-col gap-5">
          {model.schedule.earlier.length ? (
            <ScheduleGroup title="Already published" note="Before the schedule starts">
              {model.schedule.earlier.map((topic) => (
                <TopicRow key={topic.id} topic={topic} model={model} dateLabel={shortDate(topic.scheduledFor)} />
              ))}
            </ScheduleGroup>
          ) : null}
          {model.schedule.weeks.map((week) => {
            const postCount = week.slots.filter((slot) => slot.kind === "topic").length;
            return (
              <ScheduleGroup
                key={week.start}
                id={`week-${week.start}`}
                title={`Week of ${formatDate(week.start).replace(/, \d{4}$/, "")}`}
                note={`${postCount} post${postCount === 1 ? "" : "s"}`}
                current={week.start === model.thisWeek}
              >
                {week.slots.map((slot) =>
                  slot.kind === "topic" ? (
                    <TopicRow key={slot.date} topic={slot.topic} model={model} dateLabel={shortDate(slot.date)} />
                  ) : (
                    <li
                      key={slot.date}
                      className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-dashed border-[var(--sf-ink)]/15 px-3 py-2.5 text-[13px] font-semibold text-[var(--sf-soft)]"
                    >
                      <span className="w-[92px] shrink-0 text-[12.5px] font-extrabold tabular-nums">{shortDate(slot.date)}</span>
                      {slot.kind === "skip" ? `${slot.reason}, no post` : "Open slot · good for a news-driven post"}
                    </li>
                  ),
                )}
              </ScheduleGroup>
            );
          })}
          {model.schedule.later.length ? (
            <ScheduleGroup title="Later this year" note="Seasonal posts, dated to their season">
              {model.schedule.later.map((topic) => (
                <TopicRow key={topic.id} topic={topic} model={model} dateLabel={shortDate(topic.scheduledFor)} />
              ))}
            </ScheduleGroup>
          ) : null}
        </div>
      )}
    </AdminGardenPage>
  );
}

type Model = ReturnType<typeof useBlogTopicsModel>;

function ScheduleGroup({
  id,
  title,
  note,
  current = false,
  children,
}: {
  id?: string;
  title: string;
  note: string;
  current?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-label={title}
      className={`scroll-mt-6 rounded-[24px] border-[1.5px] bg-white p-4 shadow-[0_3px_0_0_rgba(43,36,29,0.08)] sm:p-5 ${
        current ? "border-[var(--sf-clay)]/50 ring-4 ring-[var(--sf-clay)]/10" : "border-[var(--sf-ink)]/12"
      }`}
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="sf-display m-0 flex items-center gap-2 text-[1.2rem] leading-[1.1] text-[var(--sf-ink)]">
          {title}
          {current ? <GChip tone="alert">This week</GChip> : null}
        </h2>
        <span className="text-[12.5px] font-extrabold tabular-nums text-[var(--sf-soft)]">{note}</span>
      </div>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">{children}</ol>
    </section>
  );
}

function TopicRow({ topic, model, dateLabel }: { topic: BlogTopic; model: Model; dateLabel?: string }) {
  const status = model.statusOf(topic);
  const open = model.openIds.has(topic.id);
  const today = model.today;
  const panelId = `topic-${topic.id}-details`;
  const overdue = topic.publishBy && today != null && topic.publishBy < today && status !== "published";
  const behind = today != null && topic.scheduledFor < today && status !== "published";
  const afterDeadline = topic.publishBy != null && topic.scheduledFor > topic.publishBy;
  const meta: ReactNode[] = [
    <span key="kw">
      <span className="text-[var(--sf-ink)]/50">Keyword</span> {topic.primaryKeyword}
    </span>,
    CLUSTER_LABEL[topic.cluster],
    FUNNEL_LABEL[topic.funnel],
    VOLUME_LABEL[topic.volume],
    embedCount(topic),
  ];
  if (!dateLabel) {
    meta.push(
      <span key="sched" className={behind ? "font-extrabold text-[#9a3422]" : ""}>
        {behind ? "Behind, was scheduled " : "Scheduled "}
        {shortDate(topic.scheduledFor)}
      </span>,
    );
  }
  if (afterDeadline) meta.push(<span key="after" className="font-extrabold text-[#6b4f00]">Scheduled after its deadline</span>);
  if (topic.publishBy) {
    meta.push(
      <span key="deadline" className={overdue ? "font-extrabold text-[#9a3422]" : ""}>
        {overdue ? "Overdue, was due " : "Deadline "}
        {formatDate(topic.publishBy)}
      </span>,
    );
  }

  return (
    <li
      id={`topic-${topic.id}`}
      className={`scroll-mt-6 rounded-[16px] border-[1.5px] transition-colors ${
        open ? "border-[var(--sf-clay)]/35 bg-[var(--sf-accent-wash)]" : "border-[var(--sf-ink)]/10 bg-[var(--sf-paper)]"
      }`}
    >
      <button
        type="button"
        onClick={() => model.toggle(topic.id)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`flex w-full items-start gap-3 rounded-[16px] p-3 text-left ${G_FOCUS} focus-visible:ring-inset focus-visible:ring-offset-0`}
      >
        {dateLabel ? (
          <span className="mt-0.5 w-[84px] shrink-0">
            <span className={`block text-[12.5px] font-extrabold tabular-nums ${behind ? "text-[#9a3422]" : "text-[var(--sf-ink)]"}`}>{dateLabel}</span>
            {behind ? <GChip tone="alert" className="mt-1">Behind</GChip> : null}
          </span>
        ) : null}
        <span className="mt-0.5">
          <PriorityChip priority={topic.priority} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold leading-snug text-[var(--sf-ink)]">{topic.workingTitle}</span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12.5px] font-semibold text-[var(--sf-soft)]">
            {meta.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>·</span> : null}
                {item}
              </span>
            ))}
          </span>
        </span>
        <GChip tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</GChip>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--sf-ink)]/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className="grid gap-5 border-t-[1.5px] border-dashed border-[var(--sf-ink)]/12 px-3 pb-4 pt-4 md:grid-cols-[minmax(0,1fr)_280px]"
        >
          <div className="flex flex-col gap-4">
            <GardenFacts
              className="!grid-cols-1"
              items={[
                { label: "Angle", value: <span className="font-semibold">{topic.angle}</span> },
                { label: "Why now", value: <span className="font-semibold">{topic.whyNow}</span> },
                { label: "Audience", value: <span className="font-semibold">{topic.audience}</span> },
              ]}
            />
            <EmbedList embeds={topic.embeds} />
            {topic.caution ? (
              <GardenNotice tone="warning" title="Careful">
                {topic.caution}
              </GardenNotice>
            ) : null}
            {topic.sources.length ? (
              <div>
                <GardenGroupHeading>Sources</GardenGroupHeading>
                <ul className="m-0 flex list-none flex-col gap-1 p-0">
                  {topic.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer" className={`${gLinkSm} !text-[13px]`}>
                        {source.label}
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-4">
            <GardenFacts
              className="!grid-cols-1"
              items={[{ label: "Slug", value: <span className="break-all font-mono text-[12.5px]">/blog/{topic.targetSlug}</span> }]}
            />
            <div>
              <GardenGroupHeading>Secondary keywords</GardenGroupHeading>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {topic.secondaryKeywords.map((keyword) => (
                  <li key={keyword}>
                    <MetaChip>{keyword}</MetaChip>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <GardenGroupHeading>Features</GardenGroupHeading>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {topic.featureSlugs.map((slug) => (
                  <li key={slug}>
                    <a
                      href={`/features/${slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`inline-flex items-center rounded-full bg-[var(--sf-peach)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--sf-clay-deep)] hover:underline ${G_FOCUS}`}
                    >
                      {slug}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <GardenGroupHeading>CTA</GardenGroupHeading>
              <a href={topic.cta.href} target="_blank" rel="noreferrer" className={`${gLinkSm} !text-[13px]`}>
                {topic.cta.label} · {topic.cta.href}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <CopyChip text={topicBrief(topic)} label="Copy brief" what="Brief" />
              {status === "idea" ? (
                <Link href="/admin/marketing/blog" className={`${gLinkSm} !text-[13px]`}>
                  Open Blog tab <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ) : (
                <a href={`/blog/${topic.targetSlug}`} target="_blank" rel="noreferrer" className={`${gLinkSm} !text-[13px]`}>
                  View post <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function EmbedList({ embeds }: { embeds: BlogTopicEmbed[] }) {
  if (!embeds.length) return null;
  return (
    <div>
      <GardenGroupHeading count={embeds.length}>In the post</GardenGroupHeading>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {embeds.map((embed, index) => {
          const snippet = embedSnippet(embed);
          const kind = EMBED_KIND[embed.kind];
          return (
            <li key={index} className="rounded-[14px] border-[1.5px] border-[var(--sf-ink)]/10 bg-white px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <GChip tone={kind.tone}>{kind.label}</GChip>
                <span className="min-w-0 flex-1 text-[13px] font-extrabold text-[var(--sf-ink)]">{embedTitle(embed)}</span>
                {snippet ? <CopyChip text={snippet} what="Snippet" /> : null}
              </div>
              {embed.kind === "demo" || embed.kind === "shot" ? (
                <p className="m-0 mt-1 text-[12.5px] font-semibold text-[var(--sf-soft)]">Caption: {embed.caption}</p>
              ) : null}
              {snippet ? (
                <code className="mt-1.5 block break-all rounded-[8px] bg-[var(--sf-paper)] px-2 py-1 font-mono text-[11.5px] text-[var(--sf-forest)]">
                  {snippet}
                </code>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
