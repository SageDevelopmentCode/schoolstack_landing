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
});
