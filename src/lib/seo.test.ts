import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pageMetadata, rootMetadata } from "./metadata";
import { articleJsonLd, serializeJsonLd } from "./seo";
import { SITE_URL } from "./site";
import { buildLlmsTxt } from "./llms-txt";
import { COMPARE_RIVAL_IDS, comparePath, compareSummary, rivalComparison } from "./marketing/compare";
import { FEATURES } from "./marketing/features";
import { featurePath } from "./marketing/features/paths";

describe("serializeJsonLd", () => {
  it("escapes < so script tags cannot break out of ld+json", () => {
    const payload = { headline: "</script><script>alert(1)</script>" };
    const serialized = serializeJsonLd(payload);

    assert.equal(serialized.includes("<"), false);
    assert.ok(serialized.includes("\\u003c/script>"));
  });
});

describe("articleJsonLd", () => {
  it("includes publish and modified dates when given", () => {
    const data = articleJsonLd({
      headline: "H",
      description: "D",
      path: "/blog/x",
      image: "/og/x.png",
      datePublished: "2026-05-14",
      dateModified: "2026-11-22",
    });
    assert.equal(data.datePublished, "2026-05-14");
    assert.equal(data.dateModified, "2026-11-22");
  });

  it("falls back to datePublished for dateModified and omits both when absent", () => {
    const withPublished = articleJsonLd({
      headline: "H",
      description: "D",
      path: "/blog/x",
      image: "/og/x.png",
      datePublished: "2026-05-14",
    });
    assert.equal(withPublished.dateModified, "2026-05-14");

    const without = articleJsonLd({ headline: "H", description: "D", path: "/blog/x", image: "/og/x.png" });
    assert.equal("datePublished" in without, false);
    assert.equal("dateModified" in without, false);
  });
});

describe("page canonicals", () => {
  it("root metadata sets no canonical, so pages never inherit the home URL", () => {
    assert.equal(rootMetadata().alternates, undefined);
  });

  it("pageMetadata sets a self canonical only when given a path", () => {
    assert.equal(pageMetadata({ title: "T", path: "/about" }).alternates?.canonical, `${SITE_URL}/about`);
    assert.equal(pageMetadata({ title: "T" }).alternates, undefined);
  });
});

describe("rival comparisons", () => {
  it("tallies every ticked MudKitchen row exactly once per rival", () => {
    for (const id of COMPARE_RIVAL_IDS) {
      const { tally, sections } = rivalComparison(id);
      const ticked = sections.flatMap((s) => s.rows).filter((r) => r.mudkitchen.mark === "yes").length;
      assert.ok(tally.total > 0);
      assert.equal(tally.total, ticked);
      assert.equal(tally.yes + tally.partial + tally.no + tally.unknown, tally.total);
    }
  });

  it("lists only partial and missing rival rows as differences", () => {
    for (const id of COMPARE_RIVAL_IDS) {
      const { differences, tally } = rivalComparison(id);
      assert.equal(differences.length, tally.partial + tally.no);
      assert.ok(differences.every((d) => d.rival.mark === "partial" || d.rival.mark === "no"));
    }
  });

  it("states the counts in the summary", () => {
    const comparison = rivalComparison("brightwheel");
    const summary = compareSummary(comparison);
    assert.ok(summary.includes(`We compared ${comparison.tally.total} capabilities`));
    assert.ok(summary.includes(comparison.rival.builtFor.toLowerCase()));
  });
});

describe("buildLlmsTxt", () => {
  it("opens with the entity summary and links every feature and comparison", () => {
    const text = buildLlmsTxt({ blogPosts: [{ slug: "a-post", title: "A post" }] });
    assert.ok(text.startsWith("# MudKitchen\n\n> MudKitchen is microschool software"));
    for (const f of FEATURES) assert.ok(text.includes(`${SITE_URL}${featurePath(f.slug)})`), f.slug);
    for (const id of COMPARE_RIVAL_IDS) assert.ok(text.includes(`${SITE_URL}${comparePath(id)})`), id);
    assert.ok(text.includes(`[A post](${SITE_URL}/blog/a-post)`));
  });

  it("leaves out the blog section when there are no posts", () => {
    assert.equal(buildLlmsTxt().includes("## Blog"), false);
  });
});
