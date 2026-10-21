import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { appendCommitteeActivityFocusParams } from "./committee-workspace-notification-links";

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  return typeof value === "string" ? value : null;
}

describe("appendCommitteeActivityFocusParams", () => {
  it("adds resource id for committee resource created", () => {
    const params = new URLSearchParams({ committee: "c1", section: "resources" });
    appendCommitteeActivityFocusParams(
      params,
      ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED,
      { entity_type: "committee_resource", entity_id: "res-1" },
      metadataString,
    );
    assert.equal(params.get("resource"), "res-1");
  });

  it("adds task id for committee task created", () => {
    const params = new URLSearchParams({ committee: "c1", section: "tasks" });
    appendCommitteeActivityFocusParams(
      params,
      ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
      { entity_type: "committee_task", entity_id: "task-1" },
      metadataString,
    );
    assert.equal(params.get("task"), "task-1");
  });

  it("adds task id for committee task assigned", () => {
    const params = new URLSearchParams({ committee: "c1", section: "tasks" });
    appendCommitteeActivityFocusParams(
      params,
      ACTIVITY_ACTIONS.COMMITTEE_TASK_ASSIGNED,
      { entity_type: "committee_task", entity_id: "task-2" },
      metadataString,
    );
    assert.equal(params.get("task"), "task-2");
  });

  it("adds event and date for committee event created", () => {
    const params = new URLSearchParams({ committee: "c1", section: "calendar" });
    appendCommitteeActivityFocusParams(
      params,
      ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED,
      {
        entity_type: "committee_event",
        entity_id: "evt-1",
        metadata: { eventDate: "2026-10-21" },
      },
      metadataString,
    );
    assert.equal(params.get("event"), "evt-1");
    assert.equal(params.get("date"), "2026-10-21");
  });
});
