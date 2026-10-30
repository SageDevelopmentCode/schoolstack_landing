import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { splitPlainTextLinks } from "./plain-text-links";

describe("splitPlainTextLinks", () => {
  it("returns plain text when there are no URLs", () => {
    assert.deepEqual(splitPlainTextLinks("Hello families."), [
      { type: "text", value: "Hello families." },
    ]);
  });

  it("returns empty array for empty string", () => {
    assert.deepEqual(splitPlainTextLinks(""), []);
  });

  it("linkifies a single https URL", () => {
    const url = "https://open.spotify.com/playlist/7IYDRbFVDIZRLktlqm8nva";
    const segments = splitPlainTextLinks(`Listen here: ${url}`);
    assert.equal(segments.length, 2);
    assert.deepEqual(segments[0], { type: "text", value: "Listen here: " });
    assert.equal(segments[1].type, "link");
    if (segments[1].type === "link") {
      assert.equal(segments[1].value, url);
      assert.ok(segments[1].href.startsWith("https://open.spotify.com/"));
    }
  });

  it("strips trailing period from URL href", () => {
    const segments = splitPlainTextLinks("See https://example.com/path.");
    assert.deepEqual(segments, [
      { type: "text", value: "See " },
      { type: "link", value: "https://example.com/path", href: "https://example.com/path" },
      { type: "text", value: "." },
    ]);
  });

  it("linkifies multiple URLs in one body", () => {
    const bandcamp = "https://cwssingingcircle.bandcamp.com/album/cws-lantern-walk-songs";
    const youtube = "https://youtu.be/LtPon5GKYNI?si=g1UD9_Hsdwg1FPvq";
    const segments = splitPlainTextLinks(`${bandcamp}\n${youtube}`);
    assert.equal(segments.filter((s) => s.type === "link").length, 2);
  });

  it("does not linkify javascript scheme", () => {
    const segments = splitPlainTextLinks("bad https://javascript:alert(1)");
    assert.ok(segments.every((s) => s.type === "text"));
  });

  it("preserves newlines in text segments", () => {
    const segments = splitPlainTextLinks("Line one\nLine two");
    assert.deepEqual(segments, [{ type: "text", value: "Line one\nLine two" }]);
  });
});
