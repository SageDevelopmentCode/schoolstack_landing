import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { isMarketingCarouselId } from "@/lib/marketing/marketing-carousel-ids";
import { SCHEDULE_AD_OPTIONS, SCHEDULE_ITEMS, SOCIAL_SCHEDULE, getScheduleItem, isScheduleItemId } from "@/lib/marketing/social-schedule";

// The carousel registry imports React components and fonts, so slide ids are checked against each
// carousel's source file instead (files are named after their carousel id).
const carouselSource = (id: string) =>
  readFileSync(path.join(process.cwd(), "src/components/admin/marketing/carousels", `${id}.tsx`), "utf8");

const DAY_MS = 24 * 60 * 60 * 1000;

describe("social schedule", () => {
  it("points every item at a real carousel and slide", () => {
    for (const item of SCHEDULE_ITEMS) {
      assert.ok(isMarketingCarouselId(item.carouselId), `${item.id}: unknown carousel ${item.carouselId}`);
      if (item.slideId) {
        assert.ok(carouselSource(item.carouselId).includes(`id: "${item.slideId}"`), `${item.id}: no slide ${item.slideId} in ${item.carouselId}`);
      }
    }
  });

  it("uses unique ids and never repeats a post", () => {
    const ids = SCHEDULE_ITEMS.map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
    const posts = SCHEDULE_ITEMS.map((item) => `${item.carouselId}/${item.slideId ?? "*"}`);
    assert.equal(new Set(posts).size, posts.length);
  });

  it("keeps each item inside its week, in date order", () => {
    for (const week of SOCIAL_SCHEDULE) {
      const start = Date.parse(week.start);
      let previous = 0;
      for (const item of week.items) {
        const day = Date.parse(item.date);
        assert.ok(day >= start && day < start + 7 * DAY_MS, `${item.id} is outside ${week.id}`);
        assert.ok(day >= previous, `${item.id} is out of order`);
        assert.ok(item.id.startsWith(item.date), `${item.id} should start with its date`);
        previous = day;
      }
    }
  });

  it("posts 5–7 times a week (ad-only weeks have no posts)", () => {
    for (const week of SOCIAL_SCHEDULE) {
      if (week.adOnly) {
        assert.equal(week.items.length, 0, `${week.id} is ad-only but has posts`);
        assert.ok((week.adOptions ?? []).length > 0, `${week.id} is ad-only but has no ad options`);
        continue;
      }
      assert.ok(week.items.length >= 5 && week.items.length <= 7, `${week.id} has ${week.items.length} posts`);
    }
  });

  it("keeps each caption's hook within Instagram's ~125-character preview", () => {
    for (const item of SCHEDULE_ITEMS) {
      const hook = item.caption.split(/(?<=[.?!])\s/)[0] ?? "";
      assert.ok(hook.length <= 125, `${item.id}: hook is ${hook.length} characters`);
    }
  });

  it("points every ad option at a real carousel and slide with ad copy", () => {
    for (const option of SCHEDULE_AD_OPTIONS) {
      assert.equal(option.kind, "ad");
      assert.ok(isMarketingCarouselId(option.carouselId), `${option.id}: unknown carousel ${option.carouselId}`);
      const source = carouselSource(option.carouselId);
      if (option.slideId) {
        assert.ok(source.includes(`id: "${option.slideId}"`), `${option.id}: no slide ${option.slideId} in ${option.carouselId}`);
      }
      assert.ok(source.includes("adCopy:"), `${option.id}: ${option.carouselId} has no ad copy`);
    }
  });

  it("keeps ad options unique, inside their week, in date order", () => {
    const ids = SCHEDULE_AD_OPTIONS.map((option) => option.id);
    assert.equal(new Set(ids).size, ids.length);
    const ads = SCHEDULE_AD_OPTIONS.map((option) => `${option.carouselId}/${option.slideId ?? "*"}`);
    assert.equal(new Set(ads).size, ads.length, "an ad is scheduled twice");
    const postIds = new Set(SCHEDULE_ITEMS.map((item) => item.id));
    for (const week of SOCIAL_SCHEDULE) {
      const start = Date.parse(week.start);
      let previous = 0;
      for (const option of week.adOptions ?? []) {
        const day = Date.parse(option.date);
        assert.ok(day >= start && day < start + 7 * DAY_MS, `${option.id} is outside ${week.id}`);
        assert.ok(day >= previous, `${option.id} is out of order`);
        assert.ok(option.id.startsWith(option.date), `${option.id} should start with its date`);
        assert.ok(!postIds.has(option.id), `${option.id} clashes with a post id`);
        previous = day;
      }
    }
  });

  it("stores statuses for posts and ad options alike", () => {
    for (const option of SCHEDULE_AD_OPTIONS) {
      assert.ok(isScheduleItemId(option.id));
      assert.equal(getScheduleItem(option.id)?.id, option.id);
    }
    for (const item of SCHEDULE_ITEMS) assert.equal(getScheduleItem(item.id)?.id, item.id);
  });
});
