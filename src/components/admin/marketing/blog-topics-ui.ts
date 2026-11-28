import {
  BLOG_SCHEDULE_FULL_UNTIL,
  BLOG_SCHEDULE_SKIPS,
  BLOG_SCHEDULE_START,
  BLOG_SCHEDULE_WEEKDAYS,
  BLOG_TOPIC_CLUSTERS,
  type BlogTopic,
  type BlogTopicCluster,
  type BlogTopicEmbed,
  type BlogTopicFunnel,
  type BlogTopicVolume,
} from "@/lib/marketing/blog-topics";
import { BLOG_DEMOS, BLOG_TOOLS } from "@/lib/marketing/blog-demos";

/*
 * Pure helpers for the Blog topics tab (/admin/marketing/blog-topics):
 * labels, embed snippets, the Tue/Thu schedule and the copyable brief.
 */

export function quote(text: string) {
  return JSON.stringify(text);
}

/** What the embed is, in a few words, for the admin list. */
export function embedTitle(embed: BlogTopicEmbed) {
  switch (embed.kind) {
    case "demo":
      return BLOG_DEMOS[embed.id].label;
    case "shot":
      return (Array.isArray(embed.src) ? embed.src : [embed.src]).join(" + ");
    case "tool":
      return BLOG_TOOLS[embed.tool].name;
    case "capture-needed":
      return embed.note;
  }
}

/** The JSX to paste into a post file (src/content/blog/posts/*.tsx). */
export function embedSnippet(embed: BlogTopicEmbed): string | null {
  switch (embed.kind) {
    case "demo":
      return `<BlogDemo id="${embed.id}" caption=${quote(embed.caption)} />`;
    case "shot":
      return Array.isArray(embed.src)
        ? `<BlogShot src={[${embed.src.map((s) => quote(s)).join(", ")}]} caption=${quote(embed.caption)} />`
        : `<BlogShot src="${embed.src}" caption=${quote(embed.caption)} />`;
    case "tool":
      return `<BlogToolCallout tool="${embed.tool}" />`;
    case "capture-needed":
      return null;
  }
}

export function embedCount(topic: BlogTopic) {
  const ready = topic.embeds.filter((embed) => embed.kind !== "capture-needed").length;
  return `${ready} embed${ready === 1 ? "" : "s"}`;
}

export type TopicStatus = "idea" | "draft" | "published";
export type PostRow = { slug: string; published: boolean };

export const STATUS_LABEL: Record<TopicStatus, string> = { idea: "Not started", draft: "Draft", published: "Published" };
export const FUNNEL_LABEL: Record<BlogTopicFunnel, string> = { top: "Top of funnel", middle: "Middle", bottom: "Bottom" };
export const VOLUME_LABEL: Record<BlogTopicVolume, string> = { high: "High volume", medium: "Medium volume", low: "Low volume" };
export const CLUSTER_LABEL = Object.fromEntries(BLOG_TOPIC_CLUSTERS.map((c) => [c.id, c.label])) as Record<BlogTopicCluster, string>;

/** Scheduled topics this many days out (plus any that are behind) show under "Up next". */
export const UP_NEXT_DAYS = 21;

export type TopicsView = "list" | "schedule";

export function subscribeNever() {
  return () => {};
}

/** Local calendar date, YYYY-MM-DD. */
export function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function fetchBlogPosts(): Promise<PostRow[]> {
  const response = await fetch("/api/admin/website-blog-posts");
  const payload = (await response.json().catch(() => null)) as { posts?: PostRow[]; error?: string } | null;
  if (!response.ok) throw new Error(payload?.error ?? "Could not load blog posts.");
  return payload?.posts ?? [];
}

export function compareTopics(a: BlogTopic, b: BlogTopic) {
  if (a.priority !== b.priority) return a.priority - b.priority;
  if (a.publishBy && b.publishBy) return a.publishBy.localeCompare(b.publishBy);
  if (a.publishBy) return -1;
  if (b.publishBy) return 1;
  return a.workingTitle.localeCompare(b.workingTitle);
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** "Tue, Dec 1" */
export function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Monday of the week the date falls in. */
export function weekStart(iso: string) {
  const day = new Date(`${iso}T12:00:00`).getDay();
  return addDays(iso, -((day + 6) % 7));
}

export type ScheduleSlot =
  | { kind: "topic"; date: string; topic: BlogTopic }
  | { kind: "skip"; date: string; reason: string }
  | { kind: "open"; date: string };

export type ScheduleWeek = { start: string; slots: ScheduleSlot[] };

/**
 * Tue/Thu slots from BLOG_SCHEDULE_START to BLOG_SCHEDULE_FULL_UNTIL, filled from the visible topics.
 * Topics dated before the start are "earlier"; after the full run, "later". Empty and skipped slots
 * only show when nothing is filtered out.
 */
export function buildSchedule(topics: BlogTopic[], showEmptySlots: boolean) {
  const byDate = new Map(topics.map((topic) => [topic.scheduledFor, topic]));
  const weeks: ScheduleWeek[] = [];
  const lastWeek = weekStart(BLOG_SCHEDULE_FULL_UNTIL);
  for (let start = weekStart(BLOG_SCHEDULE_START); start <= lastWeek; start = addDays(start, 7)) {
    const slots: ScheduleSlot[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addDays(start, offset);
      if (date < BLOG_SCHEDULE_START || date > BLOG_SCHEDULE_FULL_UNTIL) continue;
      const topic = byDate.get(date);
      if (topic) {
        slots.push({ kind: "topic", date, topic });
        continue;
      }
      const weekday = new Date(`${date}T12:00:00`).getDay();
      if (!showEmptySlots || !(BLOG_SCHEDULE_WEEKDAYS as readonly number[]).includes(weekday)) continue;
      const reason = BLOG_SCHEDULE_SKIPS[date];
      slots.push(reason ? { kind: "skip", date, reason } : { kind: "open", date });
    }
    if (slots.length) weeks.push({ start, slots });
  }
  const byDateAsc = (a: BlogTopic, b: BlogTopic) => a.scheduledFor.localeCompare(b.scheduledFor);
  return {
    earlier: topics.filter((t) => t.scheduledFor < BLOG_SCHEDULE_START).sort(byDateAsc),
    weeks,
    later: topics.filter((t) => t.scheduledFor > BLOG_SCHEDULE_FULL_UNTIL).sort(byDateAsc),
  };
}

export function topicBrief(topic: BlogTopic) {
  const lines = [
    `# ${topic.workingTitle}`,
    "",
    `- Slug: ${topic.targetSlug}`,
    `- Primary keyword: ${topic.primaryKeyword}`,
    `- Secondary keywords: ${topic.secondaryKeywords.join(", ")}`,
    `- Intent / funnel: ${topic.intent}, ${FUNNEL_LABEL[topic.funnel].toLowerCase()}`,
    `- Audience: ${topic.audience}`,
    `- Scheduled: ${shortDate(topic.scheduledFor)}, ${topic.scheduledFor.slice(0, 4)}`,
    topic.publishBy ? `- Publish by: ${formatDate(topic.publishBy)}` : null,
    `- Features: ${topic.featureSlugs.map((slug) => `/features/${slug}`).join(", ")}`,
    `- CTA: ${topic.cta.label} (${topic.cta.href})`,
    "",
    `## Angle`,
    topic.angle,
    "",
    `## Why now`,
    topic.whyNow,
    topic.caution ? `\n## Careful\n${topic.caution}` : null,
    topic.embeds.length
      ? `\n## In the post\n${topic.embeds
          .map((embed) => {
            const snippet = embedSnippet(embed);
            return snippet ? `- ${embedTitle(embed)}: \`${snippet}\`` : `- TODO: ${embedTitle(embed)}`;
          })
          .join("\n")}`
      : null,
    topic.sources.length ? `\n## Sources\n${topic.sources.map((s) => `- [${s.label}](${s.url})`).join("\n")}` : null,
  ];
  return lines.filter((line) => line !== null).join("\n");
}

