import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCreateOrganizationEventBody } from "./event-payload";

describe("parseCreateOrganizationEventBody", () => {
  const organizationId = "8adbfe08-b25b-4626-b3ac-23424a1a0a3b";

  it("parses a valid all-day event", () => {
    const parsed = parseCreateOrganizationEventBody({
      organizationId,
      title: " Harvest festival ",
      date: "2026-09-20",
      isAllDay: true,
      type: "community",
    });

    assert.ok(!("error" in parsed));
    assert.equal(parsed.organizationId, organizationId);
    assert.equal(parsed.input.title, "Harvest festival");
    assert.equal(parsed.input.isAllDay, true);
    assert.equal(parsed.input.type, "community");
  });

  it("rejects a missing title", () => {
    const parsed = parseCreateOrganizationEventBody({
      organizationId,
      title: "  ",
      date: "2026-09-20",
      isAllDay: true,
    });

    assert.ok("error" in parsed);
    assert.equal(parsed.error, "Title is required.");
  });
});
