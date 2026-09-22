import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FARM_CONNECTION_DESCRIPTION,
  getCommitteeDescriptionExcerpt,
} from "./description-excerpt";

describe("getCommitteeDescriptionExcerpt", () => {
  it("truncates Farm Connection seed description to intro plus first bullet", () => {
    const { excerpt, isTruncated } = getCommitteeDescriptionExcerpt(FARM_CONNECTION_DESCRIPTION);

    assert.equal(isTruncated, true);
    assert.match(excerpt, /regenerative agriculture with education\./);
    assert.match(excerpt, /Bridge relationships between local farmers/);
    assert.doesNotMatch(excerpt, /Launch initiatives/);
  });

  it("returns full text for two short sentences", () => {
    const description = "First sentence here. Second sentence here.";
    const { excerpt, isTruncated } = getCommitteeDescriptionExcerpt(description);

    assert.equal(isTruncated, false);
    assert.equal(excerpt, description);
  });

  it("char-truncates a single long sentence without bullets", () => {
    const description =
      "This is a very long single sentence that keeps going and going with many words about committee work and community engagement without any bullet points or second sentence to split on naturally.";
    const { excerpt, isTruncated } = getCommitteeDescriptionExcerpt(description);

    assert.equal(isTruncated, true);
    assert.ok(excerpt.length <= 141);
    assert.match(excerpt, /…$/);
  });

  it("returns empty excerpt for blank description", () => {
    const { excerpt, isTruncated } = getCommitteeDescriptionExcerpt("   ");

    assert.equal(excerpt, "");
    assert.equal(isTruncated, false);
  });
});
