import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBulletinPublishedEmailHtml,
  truncateBulletinBodyExcerpt,
} from "./emails";

describe("bulletin published email", () => {
  it("truncates long bulletin excerpts", () => {
    const longBody = "word ".repeat(100).trim();
    const excerpt = truncateBulletinBodyExcerpt(longBody, 40);
    assert.equal(excerpt.length, 40);
    assert.match(excerpt, /…$/);
  });

  it("includes title and audience in html", () => {
    const html = buildBulletinPublishedEmailHtml({
      schoolName: "Rooted Meadows",
      postTitle: "Picture day",
      audienceLabel: "School-wide",
      excerpt: "Smiles on Tuesday.",
      attachmentCount: 2,
      portalUrl: "/school/rooted-meadows/parent",
      publisherName: "Alex Admin",
    });

    assert.match(html, /Picture day/);
    assert.match(html, /School-wide/);
    assert.match(html, /2 files/);
    assert.match(html, /Alex Admin/);
  });
});
