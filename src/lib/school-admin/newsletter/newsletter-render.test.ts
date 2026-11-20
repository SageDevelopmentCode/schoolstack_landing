import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contrastRatio, newsletterAccentPalette } from "./newsletter-colors";
import { buildNewsletterArticleHtml } from "./newsletter-render";
import { createBlankEdition } from "./newsletter-sample";
import { defaultSchoolTemplate } from "./newsletter-template";
import type { NewsletterSchoolMeta } from "./newsletter-types";

const school: NewsletterSchoolMeta = {
  name: "Rooted Meadows",
  signature: "Warmly,\nThe team",
  primary: "#6B4E8F",
};

describe("buildNewsletterArticleHtml", () => {
  it("sets the school accent as hex CSS variables on the article", () => {
    const html = buildNewsletterArticleHtml(createBlankEdition(defaultSchoolTemplate()), school);
    assert.match(html, /<article class="newsletter n-garden storybook" style="--n-accent:#6B4E8F;--n-accent-deep:#[0-9A-F]{6};--n-accent-wash:#[0-9A-F]{6};--n-accent-tint:#[0-9A-F]{6};--n-on-accent:#[0-9A-F]{6}">/);
  });

  it("marks every enabled part as an edit region only in builder mode", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    const staff = [{ id: "s1", firstName: "Amy", lastName: "Lee" }];

    const family = buildNewsletterArticleHtml(edition, school, { staff });
    assert.doesNotMatch(family, /data-n-edit/);

    const builder = buildNewsletterArticleHtml(edition, school, {
      staff,
      editable: true,
      activeRegion: "events",
    });
    assert.match(builder, /data-n-edit="cover"/);
    assert.match(builder, /data-n-edit="teachers"/);
    assert.match(builder, /<div class="n-region is-active" data-n-edit="events">/);
    assert.match(builder, /<button type="button" class="n-edit-hit" data-n-edit="photos" aria-label="Edit photos">/);
    const storyIds = edition.storyBlocks
      .filter((b) => b.enabled && b.kind !== "welcome")
      .map((b) => b.id);
    for (const id of storyIds) assert.match(builder, new RegExp(`data-n-edit="story:${id}"`));
  });

  it("renders teacher updates as cards with initials", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.teacherUpdates = { s1: "We planted bulbs." };
    const html = buildNewsletterArticleHtml(edition, school, {
      staff: [{ id: "s1", firstName: "Amy", lastName: "Lee" }],
    });
    assert.match(html, /<span class="n-avatar" aria-hidden="true">AL<\/span><div><strong>Amy Lee<\/strong><p>We planted bulbs\.<\/p>/);
  });
});

describe("newsletterAccentPalette", () => {
  it("keeps small accent text readable even for a light brand colour", () => {
    const palette = newsletterAccentPalette("#F5D76E");
    assert.ok(contrastRatio(palette.deep, palette.tint) >= 4.5);
    assert.equal(palette.onAccent, "#2B241D");
  });

  it("falls back to the default accent for invalid input", () => {
    assert.equal(newsletterAccentPalette("not-a-colour").accent, "#477455");
  });
});

describe("links in newsletter text", () => {
  const YT = "https://youtu.be/vlYRDIOJ7V8?si=FW6xfUwhUHZs8u6w";
  const LINK_OPEN = (href: string) =>
    `<a class="n-link" href="${href}" target="_blank" rel="noopener noreferrer">`;

  function editionWithStory(text: string) {
    const edition = createBlankEdition(defaultSchoolTemplate());
    const block = edition.storyBlocks.find((b) => b.enabled && b.kind !== "welcome")!;
    block.value = text;
    return edition;
  }

  it("turns a pasted URL into a link that opens outside the newsletter", () => {
    const html = buildNewsletterArticleHtml(editionWithStory(`This is a great interview: ${YT}`), school);
    assert.ok(html.includes(`${LINK_OPEN(YT)}${YT}</a>`));
  });

  it("keeps trailing punctuation outside the link", () => {
    const html = buildNewsletterArticleHtml(editionWithStory("See https://example.com/a)."), school);
    assert.ok(html.includes(`${LINK_OPEN("https://example.com/a")}https://example.com/a</a>).`));
  });

  it("only links http(s) and still escapes everything else", () => {
    const html = buildNewsletterArticleHtml(
      editionWithStory('javascript:alert(1) <script>x</script> "https://ex.com/?q=<b>"'),
      school,
    );
    assert.doesNotMatch(html, /href="javascript/);
    assert.doesNotMatch(html, /<script>x<\/script>/);
    assert.doesNotMatch(html, /<b>/);
    assert.match(html, /href="https:\/\/ex\.com\/\?q=/);
  });

  it("links reminders and event notes, but never titles or captions", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.title = "Read https://example.com/title";
    edition.reminders = [{ id: "r1", text: "Forms: https://example.com/forms", keep: false }];
    edition.events = [{ id: "e1", title: "Walk https://example.com/e", date: "2026-11-20", time: "", note: "Map: https://example.com/map" }];
    edition.sections.photos = true;
    edition.photos = [{ id: "p1", src: "https://example.com/p.jpg", caption: "https://example.com/caption" }];
    const html = buildNewsletterArticleHtml(edition, school);

    assert.ok(html.includes(LINK_OPEN("https://example.com/forms")));
    assert.ok(html.includes(LINK_OPEN("https://example.com/map")));
    assert.ok(!html.includes(LINK_OPEN("https://example.com/title")));
    assert.ok(!html.includes(LINK_OPEN("https://example.com/e")));
    assert.ok(!html.includes(LINK_OPEN("https://example.com/caption")));
  });
});
