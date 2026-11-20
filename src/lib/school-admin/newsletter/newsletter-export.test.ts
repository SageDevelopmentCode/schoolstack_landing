import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildExportHtmlDocument } from "./newsletter-export";
import { createBlankEdition } from "./newsletter-sample";
import { defaultSchoolTemplate } from "./newsletter-template";
import type { NewsletterSchoolMeta } from "./newsletter-types";

const school: NewsletterSchoolMeta = {
  name: "Rooted Meadows",
  signature: "Warmly,\nThe team",
  primary: "#477455",
};

describe("buildExportHtmlDocument", () => {
  it("escapes edition title in document title and blocks script injection", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.title = '</title><script>alert(1)</script>';

    const html = buildExportHtmlDocument(edition, school);

    assert.match(html, /<title>&lt;\/title&gt;&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/title>/);
    assert.doesNotMatch(html, /<\/title><script>alert\(1\)<\/script>/);
  });

  it("includes a strict Content-Security-Policy with script-src none", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    const html = buildExportHtmlDocument(edition, school);

    assert.match(html, /http-equiv="Content-Security-Policy"/);
    assert.match(html, /script-src 'none'/);
  });

  it("lazy-loads photo grid images so long editions stay light in mobile WebViews", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.sections.photos = true;
    edition.photos = [
      { id: "p1", caption: "Garden day", src: "https://example.com/a.jpg" },
      { id: "p2", caption: "", src: "https://example.com/b.jpg" },
    ];

    const html = buildExportHtmlDocument(edition, school);
    const photoImgs = html.match(/<figure class="n-polaroid"><img [^>]*>/g) ?? [];

    assert.equal(photoImgs.length, 2);
    for (const img of photoImgs) {
      assert.match(img, /loading="lazy"/);
      assert.match(img, /decoding="async"/);
    }
  });

  it("escapes photo src so a crafted URL cannot break out of the attribute", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.sections.photos = true;
    edition.photos = [{ id: "p1", caption: "", src: 'https://x.test/a.jpg" onerror="alert(1)' }];

    const html = buildExportHtmlDocument(edition, school);

    assert.doesNotMatch(html, /" onerror="/);
    assert.match(html, /a\.jpg&quot; onerror=&quot;alert\(1\)/);
  });

  it("loads the Garden fonts and inlines the shared newsletter stylesheet", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    const html = buildExportHtmlDocument(edition, school);

    assert.match(html, /family=Bricolage\+Grotesque/);
    assert.match(html, /family=Nunito/);
    assert.match(html, /family=Gochi\+Hand/);
    assert.match(html, /\.newsletter\.n-garden \.n-quote/);
    assert.match(html, /\.newsletter\.n-garden \.n-event/);
  });

  it("never emits builder edit regions in the family-facing document", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.events = [{ id: "e1", title: "Lantern walk", date: "2026-11-20", time: "5pm", note: "" }];
    const html = buildExportHtmlDocument(edition, school);

    assert.doesNotMatch(html, /data-n-edit=/);
    assert.doesNotMatch(html, /class="n-edit-hit"/);
    assert.doesNotMatch(html, /class="n-placeholder"/);
  });
});
