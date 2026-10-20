import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGalleryPageMeta,
  parseGalleryListQuery,
} from "@/lib/school-gallery/gallery-pagination";

describe("buildGalleryPageMeta", () => {
  it("detects hasMore when an extra row was fetched", () => {
    const meta = buildGalleryPageMeta(0, 48, 49);
    assert.equal(meta.hasMore, true);
    assert.equal(meta.nextOffset, 48);
  });

  it("returns no more when row count fits the page", () => {
    const meta = buildGalleryPageMeta(48, 48, 12);
    assert.equal(meta.hasMore, false);
    assert.equal(meta.nextOffset, 60);
  });
});

describe("parseGalleryListQuery", () => {
  it("defaults limit and offset", () => {
    const parsed = parseGalleryListQuery(new URLSearchParams());
    assert.equal(parsed.limit, 48);
    assert.equal(parsed.offset, 0);
  });

  it("caps limit at max", () => {
    const parsed = parseGalleryListQuery(
      new URLSearchParams({ limit: "500", offset: "10" }),
    );
    assert.equal(parsed.limit, 100);
    assert.equal(parsed.offset, 10);
  });
});
