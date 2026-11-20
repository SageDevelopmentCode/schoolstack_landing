import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildResearchPrompt } from "@/components/admin/demos/outreach-ui";

describe("buildResearchPrompt", () => {
  const base = { slug: "wonderhere-lakeland", schoolName: "WonderHere Lakeland", demoHref: "/demo/wonderhere-lakeland", crmStatusLabel: "Not Contacted" };

  it("starts with the skill command and carries the school's details", () => {
    const prompt = buildResearchPrompt({ ...base, website: "https://wonderhere.example", contactName: "Jo Smith" });
    const lines = prompt.split("\n");
    assert.equal(lines[0], "/school-outreach-research wonderhere-lakeland");
    assert.ok(prompt.includes("School: WonderHere Lakeland"));
    assert.ok(prompt.includes("Demo: https://www.trymudkitchen.com/demo/wonderhere-lakeland"));
    assert.ok(prompt.includes("Website: https://wonderhere.example"));
    assert.ok(prompt.includes("CRM status: Not Contacted"));
    assert.ok(prompt.includes("Known contact: Jo Smith"));
    assert.ok(prompt.includes("src/data/outreach/wonderhere-lakeland.ts"));
    assert.ok(prompt.includes("Don't send anything."));
  });

  it("asks Claude to find what the CRM doesn't have", () => {
    const prompt = buildResearchPrompt({ ...base, website: "", contactName: null });
    assert.ok(prompt.includes("Website: not in the CRM yet. Find it."));
    assert.ok(prompt.includes("Known contact: none yet."));
  });

  it("never includes email addresses or phone numbers", () => {
    const prompt = buildResearchPrompt({ ...base, website: "info@school.example", contactName: "Jo (512) 555-1234 jo@school.example" });
    assert.doesNotMatch(prompt, /@/);
    assert.doesNotMatch(prompt, /555/);
    assert.ok(prompt.includes("Known contact: Jo"));
  });
});
