import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  describeParentPortalCalendarScope,
  formatOrganizationEventAudienceLabel,
  mainPortalAudienceScope,
  programPortalAudienceScope,
} from "./event-audience";
import type { OrganizationEvent } from "./types";

describe("event audience helpers", () => {
  it("formats school-wide audience label", () => {
    const event: OrganizationEvent = {
      id: "event-1",
      organizationId: "org-1",
      title: "Open house",
      date: "2026-09-10",
      isAllDay: true,
      type: "community",
      sortOrder: 0,
    };

    assert.equal(
      formatOrganizationEventAudienceLabel(event, new Map()),
      "All families (main portal + every program portal)",
    );
  });

  it("formats program audience label", () => {
    const event: OrganizationEvent = {
      id: "event-2",
      organizationId: "org-1",
      programId: "program-coop",
      title: "Co-op picnic",
      date: "2026-09-12",
      isAllDay: true,
      type: "community",
      sortOrder: 0,
    };

    assert.equal(
      formatOrganizationEventAudienceLabel(
        event,
        new Map([["program-coop", "Kindergarten Co-op"]]),
      ),
      "Kindergarten Co-op",
    );
  });

  it("describes calendar scope copy", () => {
    assert.match(describeParentPortalCalendarScope(false), /school-wide events only/i);
    assert.match(describeParentPortalCalendarScope(true), /program only/i);
  });

  it("builds audience scopes", () => {
    assert.deepEqual(mainPortalAudienceScope(), { mode: "main_portal" });
    assert.deepEqual(programPortalAudienceScope("program-1"), {
      mode: "program_portal",
      programId: "program-1",
    });
  });
});
