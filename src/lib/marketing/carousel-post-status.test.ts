import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countPostedSlides,
  isSlidePosted,
  SLIDE_ID_PATTERN,
  statusesFromRows,
} from "@/lib/marketing/carousel-post-status";

describe("carousel post status", () => {
  it("maps entry rows ('' slide) and slide rows separately", () => {
    const statuses = statusesFromRows([
      { carousel_id: "ads-holiday-gift", slide_id: "gift-tag", posted: true, posted_at: "2026-11-21T10:00:00Z" },
      { carousel_id: "ads-holiday-gift", slide_id: "stocking", posted: false, posted_at: null },
      { carousel_id: "mascot-fennel-attendance", slide_id: "", posted: true, posted_at: "2026-11-20T10:00:00Z" },
    ]);
    assert.equal(statuses["ads-holiday-gift"].posted, false);
    assert.deepEqual(statuses["ads-holiday-gift"].slides["gift-tag"], { posted: true, postedAt: "2026-11-21T10:00:00Z" });
    assert.equal(statuses["ads-holiday-gift"].slides.stocking.posted, false);
    assert.equal(statuses["mascot-fennel-attendance"].posted, true);
    assert.deepEqual(statuses["mascot-fennel-attendance"].slides, {});
  });

  it("keeps slide rows when the entry row comes after them", () => {
    const statuses = statusesFromRows([
      { carousel_id: "one-place-ad", slide_id: "one-place", posted: false, posted_at: null },
      { carousel_id: "one-place-ad", slide_id: "", posted: true, posted_at: null },
    ]);
    assert.equal(statuses["one-place-ad"].posted, true);
    assert.equal(statuses["one-place-ad"].slides["one-place"].posted, false);
  });

  it("treats rows without slide_id (before the migration) as entry rows and drops unknown ids", () => {
    const statuses = statusesFromRows([
      { carousel_id: "ads-pain-proof", posted: true, posted_at: null },
      { carousel_id: "not-a-carousel", slide_id: "x", posted: true, posted_at: null },
    ]);
    assert.equal(statuses["ads-pain-proof"].posted, true);
    assert.equal("not-a-carousel" in statuses, false);
  });

  it("falls back to the entry flag for slides without their own row", () => {
    const status = { posted: true, postedAt: null, slides: { b: { posted: false, postedAt: null } } };
    assert.equal(isSlidePosted(status, "a"), true);
    assert.equal(isSlidePosted(status, "b"), false);
    assert.equal(isSlidePosted(undefined, "a"), false);
    assert.equal(countPostedSlides(status, ["a", "b", "c"]), 2);
  });

  it("accepts kebab-case slide ids only", () => {
    assert.ok(SLIDE_ID_PATTERN.test("gift-tag"));
    assert.ok(!SLIDE_ID_PATTERN.test("../x"));
    assert.ok(!SLIDE_ID_PATTERN.test(""));
  });
});
