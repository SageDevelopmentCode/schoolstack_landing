import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SNAPSHOT_AREAS } from "@/data/outreach/types";
import { isCapabilityId } from "@/data/outreach/mudkitchen-capabilities";
import { DETECTABLE_TOOL_NAMES } from "@/lib/outreach/site-audit";
import { TOOL_REPLACEMENTS, capabilityLabel, needsCustomWork } from "@/lib/outreach/tool-replacements";

describe("TOOL_REPLACEMENTS", () => {
  it("covers every tool name detectTools can return, with valid capability ids and moments", () => {
    for (const name of DETECTABLE_TOOL_NAMES) {
      const entry = TOOL_REPLACEMENTS[name];
      assert.ok(entry, `no TOOL_REPLACEMENTS entry for "${name}"`);
      assert.ok((SNAPSHOT_AREAS as readonly string[]).includes(entry.moment), `${name}: bad moment ${entry.moment}`);
      for (const id of entry.replacedBy) assert.ok(isCapabilityId(id), `${name}: unknown capability ${id}`);
      if (!entry.keep) assert.ok(entry.replacedBy.length > 0, `${name}: replaced by nothing`);
    }
  });

  it("has no entries for tools the crawler can't detect", () => {
    for (const name of Object.keys(TOOL_REPLACEMENTS)) {
      assert.ok(DETECTABLE_TOOL_NAMES.includes(name), `"${name}" is mapped but never detected`);
    }
  });

  it("keeps funding and donation platforms", () => {
    for (const name of ["Odyssey", "ClassWallet", "Givebutter", "Zeffy"]) assert.equal(TOOL_REPLACEMENTS[name].keep, true);
    assert.deepEqual(TOOL_REPLACEMENTS.ClassWallet.replacedBy, ["third-party-payer-billing"]);
  });

  it("labels shipped vs custom capabilities", () => {
    assert.match(capabilityLabel("online-application"), /\(in MudKitchen\)$/);
    assert.match(capabilityLabel("class-billing"), /\(we'd build\)$/);
    assert.equal(needsCustomWork(TOOL_REPLACEMENTS.Omella), true);
    assert.equal(needsCustomWork(TOOL_REPLACEMENTS.Jotform), false);
  });
});
