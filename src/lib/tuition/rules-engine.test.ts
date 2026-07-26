import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { previewRuleMatches } from "./rules-engine";

describe("previewRuleMatches", () => {
  it("returns an empty list when the rule does not exist", async () => {
    const supabase = {
      from() {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: null, error: null }),
            }),
          }),
        };
      },
    };

    const matches = await previewRuleMatches(supabase as never, "missing-rule");
    assert.deepEqual(matches, []);
  });
});
