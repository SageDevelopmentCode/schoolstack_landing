import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_ADJUSTMENT_REASONS,
  normalizeAdjustmentReasons,
  resolveAdjustmentReasons,
  sanitizeAdjustmentReasonDraft,
} from "./adjustment-reasons";
import { parseTuitionOrgSettings } from "./org-settings";

describe("resolveAdjustmentReasons", () => {
  it("returns defaults when org has no stored reasons", () => {
    assert.deepEqual(resolveAdjustmentReasons({}), [...DEFAULT_ADJUSTMENT_REASONS]);
  });

  it("returns stored reasons when present", () => {
    assert.deepEqual(
      resolveAdjustmentReasons({ adjustmentReasons: ["Board discount", "Scholarship"] }),
      ["Board discount", "Scholarship"],
    );
  });
});

describe("normalizeAdjustmentReasons", () => {
  it("trims, dedupes case-insensitively, and drops blanks", () => {
    assert.deepEqual(
      normalizeAdjustmentReasons([
        "  Sibling discount ",
        "sibling discount",
        "",
        "Financial aid",
      ]),
      ["Sibling discount", "Financial aid"],
    );
  });

  it("caps reason length", () => {
    const long = "a".repeat(100);
    const normalized = normalizeAdjustmentReasons([long]);
    assert.equal(normalized[0]?.length, 80);
  });
});

describe("sanitizeAdjustmentReasonDraft", () => {
  it("rejects empty lists", () => {
    const result = sanitizeAdjustmentReasonDraft(["", "   "]);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /at least one/i);
    }
  });

  it("accepts valid drafts", () => {
    const result = sanitizeAdjustmentReasonDraft(["  Scholarship ", "Board discount"]);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.reasons, ["Scholarship", "Board discount"]);
    }
  });
});

describe("parseTuitionOrgSettings adjustmentReasons", () => {
  it("parses non-empty adjustment reasons", () => {
    const settings = parseTuitionOrgSettings({
      adjustmentReasons: [" Scholarship ", "", "Board discount"],
    });
    assert.deepEqual(settings.adjustmentReasons, ["Scholarship", "Board discount"]);
  });
});
