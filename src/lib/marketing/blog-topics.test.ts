import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BLOG_DEMOS, blogShotUrl, isBlogDemoId } from "@/lib/marketing/blog-demos";
import { BLOG_SCHEDULE_SKIPS, BLOG_SCHEDULE_START, BLOG_SCHEDULE_WEEKDAYS, BLOG_TOPICS } from "@/lib/marketing/blog-topics";
import { FEATURE_SHOTS } from "@/lib/marketing/features/shots";
import { FEATURE_SLUGS } from "@/lib/marketing/features";

const SHOT_URLS = new Set(Object.values(FEATURE_SHOTS).flat().map((shot) => shot.src));

describe("blog topics", () => {
  it("has unique ids and slugs", () => {
    assert.equal(new Set(BLOG_TOPICS.map((t) => t.id)).size, BLOG_TOPICS.length);
    assert.equal(new Set(BLOG_TOPICS.map((t) => t.targetSlug)).size, BLOG_TOPICS.length);
  });

  it("only names real features", () => {
    for (const topic of BLOG_TOPICS) {
      for (const slug of topic.featureSlugs) assert.ok(FEATURE_SLUGS.includes(slug), `${topic.id}: ${slug}`);
    }
    for (const [id, meta] of Object.entries(BLOG_DEMOS)) assert.ok(FEATURE_SLUGS.includes(meta.feature.slug), id);
  });

  it("plans at least one embed per topic, and every demo and screenshot exists", () => {
    for (const topic of BLOG_TOPICS) {
      assert.ok(topic.embeds.length > 0, `${topic.id} has no embeds`);
      for (const embed of topic.embeds) {
        if (embed.kind === "demo") assert.ok(isBlogDemoId(embed.id), `${topic.id}: demo ${embed.id}`);
        if (embed.kind === "shot") {
          for (const src of Array.isArray(embed.src) ? embed.src : [embed.src]) {
            assert.ok(SHOT_URLS.has(blogShotUrl(src)), `${topic.id}: screenshot ${src} is not in FEATURE_SHOTS`);
          }
        }
      }
    }
  });

  it("schedules every topic on its own Tuesday or Thursday, before any deadline", () => {
    const dates = BLOG_TOPICS.map((t) => t.scheduledFor);
    assert.equal(new Set(dates).size, dates.length, "two topics share a date");
    for (const topic of BLOG_TOPICS) {
      assert.match(topic.scheduledFor, /^\d{4}-\d{2}-\d{2}$/, topic.id);
      if (topic.publishBy) assert.ok(topic.scheduledFor <= topic.publishBy, `${topic.id} is scheduled after its deadline`);
      if (topic.scheduledFor < BLOG_SCHEDULE_START) continue;
      const weekday = new Date(`${topic.scheduledFor}T12:00:00Z`).getUTCDay();
      assert.ok((BLOG_SCHEDULE_WEEKDAYS as readonly number[]).includes(weekday), `${topic.id} is not on a Tue/Thu`);
      assert.ok(!(topic.scheduledFor in BLOG_SCHEDULE_SKIPS), `${topic.id} is on a skipped day`);
    }
  });
});
