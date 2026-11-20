import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeWebsiteUrl, sanitizePlanLines } from "@/lib/marketing/lead-magnets";
import { sanitizeAttribution } from "@/lib/marketing/attribution";

describe("sanitizePlanLines", () => {
  it("removes links and bare domains", () => {
    const [a, b, c] = sanitizePlanLines([
      "Visit https://evil.example/win now",
      "or www.spam.biz today",
      "cheap-pills.ru/buy",
    ]);
    assert.equal(a, "Visit [link removed] now");
    assert.equal(b, "or [link removed] today");
    assert.equal(c, "[link removed]");
  });

  it("keeps money and plain numbers", () => {
    assert.deepEqual(sanitizePlanLines(["Tuition: $1,250.00 / month", "12.5 students"]), [
      "Tuition: $1,250.00 / month",
      "12.5 students",
    ]);
  });

  it("caps line count and length and drops non-strings", () => {
    const lines = sanitizePlanLines([...Array(300).fill("x".repeat(1000)), 42]);
    assert.equal(lines.length, 150);
    assert.equal(lines[0].length, 400);
    assert.deepEqual(sanitizePlanLines("nope"), []);
  });
});

describe("normalizeWebsiteUrl", () => {
  it("adds a scheme and trims the trailing slash", () => {
    assert.equal(normalizeWebsiteUrl("oakschool.org/"), "https://oakschool.org");
    assert.equal(normalizeWebsiteUrl("http://oak.school/about"), "http://oak.school/about");
  });

  it("rejects values without a domain", () => {
    assert.equal(normalizeWebsiteUrl("my school"), null);
    assert.equal(normalizeWebsiteUrl(""), null);
  });
});

describe("sanitizeAttribution", () => {
  it("keeps known string fields, trimmed and capped", () => {
    assert.deepEqual(
      sanitizeAttribution({ utmSource: " google ", gclid: "x".repeat(400), evil: "y", utmTerm: 5 }),
      { utmSource: "google", gclid: "x".repeat(300) },
    );
    assert.deepEqual(sanitizeAttribution(null), {});
  });
});
