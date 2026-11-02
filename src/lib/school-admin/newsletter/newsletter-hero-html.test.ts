import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBlankEdition } from "./newsletter-sample";
import { defaultSchoolTemplate } from "./newsletter-template";
import { newsletterHeroHtml } from "./newsletter-render";

describe("newsletterHeroHtml", () => {
  it("uses img src for cover and overlay-only inline style (no broken style attribute)", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.title = "This week at our school";
    edition.coverImage =
      'https://example.supabase.co/storage/v1/object/sign/cover.jpg?token=eyJ"nested"';

    const html = newsletterHeroHtml(edition, { primaryColor: "#477455" }, edition.title, "<p>Hi</p>");

    assert.match(html, /class="n-hero n-hero--cover"/);
    assert.match(html, /<img class="n-hero-media" src="https:\/\/example\.supabase\.co/);
    assert.doesNotMatch(html, /--n-hero-cover:url\("/);
    assert.match(html, /--n-hero-overlay-bottom:rgba\(/);
    assert.doesNotMatch(html, /style="--n-hero-cover:url\("/);
  });

  it("absolutizes relative cover paths", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.coverImage = "/newsletter-assets/cover.jpg";

    const html = newsletterHeroHtml(edition, {}, "Title", "");

    assert.match(html, /<img class="n-hero-media" src="[^"]+\/newsletter-assets\/cover\.jpg"/);
  });

  it("renders plain hero when no cover", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    const html = newsletterHeroHtml(edition, {}, "Title", "");
    assert.match(html, /<header class="n-hero">/);
    assert.doesNotMatch(html, /n-hero--cover/);
  });
});
