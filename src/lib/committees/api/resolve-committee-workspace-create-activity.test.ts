import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  COMMITTEE_WORKSPACE_CREATE_MAX_AGE_MS,
  resolveCommitteeWorkspaceCreateActivity,
} from "./resolve-committee-workspace-create-activity";

function recentCreatedAt(): string {
  return new Date().toISOString();
}

function staleCreatedAt(): string {
  return new Date(
    Date.now() - COMMITTEE_WORKSPACE_CREATE_MAX_AGE_MS - 60_000,
  ).toISOString();
}

function mockSupabaseForTable(
  table: string,
  row: Record<string, unknown> | null,
) {
  return {
    from: (name: string) => {
      assert.equal(name, table);
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: row, error: null }),
            }),
          }),
        }),
      };
    },
  };
}

describe("resolveCommitteeWorkspaceCreateActivity", () => {
  it("rejects disallowed actions", async () => {
    const result = await resolveCommitteeWorkspaceCreateActivity(
      mockSupabaseForTable("committee_tasks", null) as never,
      {
        committeeId: "committee-1",
        action: ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED,
        entityId: "entity-1",
      },
    );

    assert.equal(result.ok, false);
    if (result.ok) throw new Error("expected failure");
    assert.equal(result.code, "action_not_allowed");
  });

  it("returns invalid_entity when task row is missing", async () => {
    const result = await resolveCommitteeWorkspaceCreateActivity(
      mockSupabaseForTable("committee_tasks", null) as never,
      {
        committeeId: "committee-1",
        action: ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
        entityId: "task-1",
      },
    );

    assert.equal(result.ok, false);
    if (result.ok) throw new Error("expected failure");
    assert.equal(result.code, "invalid_entity");
  });

  it("rejects tasks older than the create window", async () => {
    const result = await resolveCommitteeWorkspaceCreateActivity(
      mockSupabaseForTable("committee_tasks", {
        id: "task-1",
        title: "Snacks",
        status: "open",
        created_at: staleCreatedAt(),
      }) as never,
      {
        committeeId: "committee-1",
        action: ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
        entityId: "task-1",
      },
    );

    assert.equal(result.ok, false);
    if (result.ok) throw new Error("expected failure");
    assert.equal(result.code, "entity_too_old");
  });

  it("builds server summary and metadata for a recent task", async () => {
    const result = await resolveCommitteeWorkspaceCreateActivity(
      mockSupabaseForTable("committee_tasks", {
        id: "task-1",
        title: "Bring snacks",
        status: "open",
        created_at: recentCreatedAt(),
      }) as never,
      {
        committeeId: "committee-1",
        action: ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
        entityId: "task-1",
      },
    );

    assert.equal(result.ok, true);
    if (!result.ok) throw new Error("expected success");
    assert.equal(result.activity.entityType, "committee_task");
    assert.equal(
      result.activity.summary,
      'Task "Bring snacks" was created',
    );
    assert.deepEqual(result.activity.metadata, {
      taskTitle: "Bring snacks",
      taskStatus: "open",
    });
  });

  it("builds server summary for a recent resource", async () => {
    const result = await resolveCommitteeWorkspaceCreateActivity(
      mockSupabaseForTable("committee_resources", {
        id: "resource-1",
        title: "Volunteer guide",
        resource_type: "link",
        created_at: recentCreatedAt(),
      }) as never,
      {
        committeeId: "committee-1",
        action: ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED,
        entityId: "resource-1",
      },
    );

    assert.equal(result.ok, true);
    if (!result.ok) throw new Error("expected success");
    assert.equal(result.activity.entityType, "committee_resource");
    assert.equal(
      result.activity.summary,
      'Resource "Volunteer guide" was added',
    );
  });

  it("builds server summary for a recent event", async () => {
    const result = await resolveCommitteeWorkspaceCreateActivity(
      mockSupabaseForTable("committee_events", {
        id: "event-1",
        title: "Planning meeting",
        event_date: "2026-10-01",
        created_at: recentCreatedAt(),
      }) as never,
      {
        committeeId: "committee-1",
        action: ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED,
        entityId: "event-1",
      },
    );

    assert.equal(result.ok, true);
    if (!result.ok) throw new Error("expected success");
    assert.equal(result.activity.entityType, "committee_event");
    assert.equal(
      result.activity.summary,
      'Calendar event "Planning meeting" was added',
    );
    assert.equal(result.activity.metadata.eventDate, "2026-10-01");
  });
});
