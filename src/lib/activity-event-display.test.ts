import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import type { ActivityEventRow } from "@/lib/activity-log";
import {
  formatActivityActionPhrase,
  formatActivityEventNarrative,
  getActivityEventVisual,
  resolveActorDisplayLabel,
} from "@/lib/activity-event-display";
import { AlertCircle, AlertTriangle } from "lucide-react";

function baseEvent(
  overrides: Partial<ActivityEventRow> = {},
): ActivityEventRow {
  return {
    id: "event-1",
    organization_id: "org-1",
    actor_type: "parent",
    actor_user_id: "user-1",
    actor_name: null,
    actor_email: null,
    surface: "parent_portal",
    action: ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_COMPLETED,
    entity_type: "enrollment_checklist_item",
    entity_id: "item-1",
    summary: "Completed an enrollment checklist item",
    metadata: {},
    severity: "info",
    created_at: "2026-07-30T12:00:00.000Z",
    organizations: {
      id: "org-1",
      slug: "rooted-meadows",
      name: "Rooted Meadows Waldorf School",
    },
    ...overrides,
  };
}

describe("formatActivityActionPhrase", () => {
  it("returns a readable phrase for known actions", () => {
    assert.equal(
      formatActivityActionPhrase(
        ACTIVITY_ACTIONS.ENROLLMENT_CHECKLIST_ITEM_COMPLETED,
      ),
      "completed an enrollment checklist item",
    );
  });

  it("falls back to the summary when action is unknown", () => {
    assert.equal(
      formatActivityActionPhrase("custom.action", "Did something custom"),
      "did something custom",
    );
  });
});

describe("resolveActorDisplayLabel", () => {
  it("prefers stored actor_name", () => {
    assert.equal(
      resolveActorDisplayLabel(
        baseEvent({ actor_name: "Jane Doe", actor_email: "jane@example.com" }),
      ),
      "Jane Doe",
    );
  });

  it("uses enrichment name when stored name is missing", () => {
    assert.equal(
      resolveActorDisplayLabel(baseEvent(), {
        displayActorName: "Jane Doe",
        displayActorEmail: "jane@example.com",
      }),
      "Jane Doe",
    );
  });

  it("falls back to actor email", () => {
    assert.equal(
      resolveActorDisplayLabel(baseEvent({ actor_email: "jane@example.com" })),
      "jane@example.com",
    );
  });

  it("falls back to actor type label", () => {
    assert.equal(
      resolveActorDisplayLabel(
        baseEvent({ actor_type: "system", actor_user_id: null }),
      ),
      "System",
    );
  });
});

describe("formatActivityEventNarrative", () => {
  it("formats actor + action + school", () => {
    assert.equal(
      formatActivityEventNarrative(baseEvent(), {
        displayActorName: "Jane Doe",
        displayActorEmail: null,
      }),
      "Jane Doe completed an enrollment checklist item for Rooted Meadows Waldorf School",
    );
  });

  it("formats system events without a personal actor name", () => {
    assert.equal(
      formatActivityEventNarrative(
        baseEvent({
          actor_type: "system",
          actor_user_id: null,
          action: ACTIVITY_ACTIONS.APPLICATION_PAYMENT_COMPLETED,
          summary: "Combined enrollment checklist payment completed",
        }),
      ),
      "System completed a payment for Rooted Meadows Waldorf School",
    );
  });

  it("omits school when organization is missing", () => {
    assert.equal(
      formatActivityEventNarrative(
        baseEvent({ organizations: null }),
        { displayActorName: "Jane Doe", displayActorEmail: null },
      ),
      "Jane Doe completed an enrollment checklist item",
    );
  });
});

describe("getActivityEventVisual", () => {
  it("uses error styling for error severity", () => {
    const visual = getActivityEventVisual(
      baseEvent({
        severity: "error",
        action: ACTIVITY_ACTIONS.API_ERROR,
      }),
    );
    assert.equal(visual.Icon, AlertCircle);
    assert.match(visual.className, /red/);
  });

  it("uses warning styling for warning severity", () => {
    const visual = getActivityEventVisual(
      baseEvent({
        severity: "warning",
        action: ACTIVITY_ACTIONS.NOTIFICATION_FAILED,
      }),
    );
    assert.equal(visual.Icon, AlertTriangle);
    assert.match(visual.className, /amber/);
  });

  it("uses category styling for info severity", () => {
    const visual = getActivityEventVisual(baseEvent({ severity: "info" }));
    assert.match(visual.className, /emerald/);
  });
});
