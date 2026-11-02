import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBlankEdition } from "./newsletter-sample";
import { defaultSchoolTemplate } from "./newsletter-template";
import {
  assertNewsletterPhotoCaptionLimits,
  MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH,
} from "./newsletter-limits";
import { NewsletterError } from "./newsletter-errors";

describe("assertNewsletterPhotoCaptionLimits", () => {
  it("allows captions at the max length", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.photos = [
      {
        id: "p1",
        src: "",
        caption: "a".repeat(MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH),
      },
    ];
    assert.doesNotThrow(() => assertNewsletterPhotoCaptionLimits(edition));
  });

  it("rejects captions over the max length", () => {
    const edition = createBlankEdition(defaultSchoolTemplate());
    edition.photos = [
      {
        id: "p1",
        src: "",
        caption: "a".repeat(MAX_NEWSLETTER_PHOTO_CAPTION_LENGTH + 1),
      },
    ];
    assert.throws(
      () => assertNewsletterPhotoCaptionLimits(edition),
      (err: unknown) => {
        assert.ok(err instanceof NewsletterError);
        assert.equal(err.code, "limit_photo_caption");
        assert.equal(err.status, 400);
        return true;
      },
    );
  });
});
