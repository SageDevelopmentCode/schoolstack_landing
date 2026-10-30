import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

describe("preview-portal-options family subject resolution", () => {
  it("uses getFamilyPreviewGuardianUserId for familyId queries", () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(dir, "preview-portal-options.ts"), "utf8");
    assert.match(source, /getFamilyPreviewGuardianUserId/);
    assert.doesNotMatch(source, /\.limit\(1\)\s*\n\s*\.maybeSingle\(\)/);
  });
});
