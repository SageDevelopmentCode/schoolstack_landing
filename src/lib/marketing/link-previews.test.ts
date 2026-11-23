import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  LINK_PREVIEW_CARDS,
  linkPreviewCard,
  linkPreviewImageUrl,
  OG_VERSION,
} from "@/lib/marketing/link-previews";

const OG_DIR = join(process.cwd(), "public/og");

describe("link previews", () => {
  it("has an exported 1200×630 PNG under 300 KB for every card", () => {
    for (const card of LINK_PREVIEW_CARDS) {
      const file = join(OG_DIR, `${card.id}.png`);
      assert.ok(existsSync(file), `missing public/og/${card.id}.png — export it from the studio's Link previews tab`);
      const bytes = readFileSync(file);
      // PNG IHDR: width and height are big-endian at bytes 16 and 20.
      assert.equal(bytes.readUInt32BE(16), 1200, `${card.id}.png width`);
      assert.equal(bytes.readUInt32BE(20), 630, `${card.id}.png height`);
      assert.ok(statSync(file).size < 300 * 1024, `${card.id}.png is over 300 KB — run node scripts/optimize-og-images.mjs`);
    }
  });

  it("gives each route at most one card and unique ids", () => {
    const ids = LINK_PREVIEW_CARDS.map((c) => c.id);
    assert.equal(new Set(ids).size, ids.length);
    const paths = LINK_PREVIEW_CARDS.flatMap((c) => c.paths);
    assert.equal(new Set(paths).size, paths.length);
  });

  it("maps routes to cards, with blog posts on the blog card and everything else on home", () => {
    assert.equal(linkPreviewCard("/get-started").id, "get-started");
    assert.equal(linkPreviewCard("/free-preview/").id, "free-preview");
    assert.equal(linkPreviewCard("/blog/some-post").id, "blog");
    assert.equal(linkPreviewCard("/privacy").id, "home");
    assert.equal(linkPreviewCard(undefined).id, "home");
  });

  it("versions image URLs so crawlers refetch after a re-export", () => {
    assert.equal(linkPreviewImageUrl(linkPreviewCard("/about")), `/og/about.png?v=${OG_VERSION}`);
  });
});
