import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { isMarketingCarouselId } from "@/lib/marketing/marketing-carousel-ids";
import { SCHEDULE_ITEMS, SOCIAL_SCHEDULE } from "@/lib/marketing/social-schedule";

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

  it("posts 5–7 times a week", () => {
    for (const week of SOCIAL_SCHEDULE) {
      assert.ok(week.items.length >= 5 && week.items.length <= 7, `${week.id} has ${week.items.length} posts`);
    }
  });

  it("keeps each caption's hook within Instagram's ~125-character preview", () => {
    for (const item of SCHEDULE_ITEMS) {
      const hook = item.caption.split(/(?<=[.?!])\s/)[0] ?? "";
      assert.ok(hook.length <= 125, `${item.id}: hook is ${hook.length} characters`);
    }
  });
});
