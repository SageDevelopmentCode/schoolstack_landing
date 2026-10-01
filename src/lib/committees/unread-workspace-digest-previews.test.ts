import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCalendarDigestPreview,
  formatMessageDigestPreview,
  formatTaskDigestPreview,
  isEntityCreatedAfterRead,
  stripMessageBodyForDigest,
  truncateDigestPreview,
} from "./unread-workspace-digest-preview-format";

describe("unread-workspace-digest-preview-format", () => {
  it("strips HTML and collapses whitespace from message bodies", () => {
    assert.equal(stripMessageBodyForDigest("<p>Hello <strong>team</strong></p>"), "Hello team");
  });

  it("truncates long preview text", () => {
    const long = "a".repeat(150);
    assert.equal(truncateDigestPreview(long, 120).length, 120);
    assert.equal(truncateDigestPreview(long, 120).endsWith("…"), true);
  });

  it("formats message preview with sender", () => {
    assert.equal(formatMessageDigestPreview("Ada", "Quick update"), "Ada: Quick update");
  });

  it("formats task preview with due date", () => {
    assert.match(formatTaskDigestPreview("Pack lunches", "2026-10-15"), /Pack lunches \(due Oct/);
  });

  it("formats calendar preview with date", () => {
    const preview = formatCalendarDigestPreview("Work day", "2026-10-20", "9:00 AM");
    assert.match(preview, /Work day/);
    assert.match(preview, /9:00 AM/);
  });

  it("isEntityCreatedAfterRead respects read cutoff", () => {
    assert.equal(
      isEntityCreatedAfterRead("2026-10-02T00:00:00.000Z", "2026-10-01T00:00:00.000Z"),
      true,
    );
    assert.equal(
      isEntityCreatedAfterRead("2026-10-01T00:00:00.000Z", "2026-10-02T00:00:00.000Z"),
      false,
    );
    assert.equal(isEntityCreatedAfterRead("2026-10-01T00:00:00.000Z", null), true);
  });
});
