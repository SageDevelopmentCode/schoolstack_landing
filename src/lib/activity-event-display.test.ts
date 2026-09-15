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
import { AlertCircle, AlertTriangle, MessageSquare } from "lucide-react";

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

describe("formatActivityEventNarrative", () => {
  it("appends a mobile label when metadata.client is mobile", () => {
    assert.equal(
      formatActivityEventNarrative(
        baseEvent({
          action: ACTIVITY_ACTIONS.AUTH_SIGNED_IN,
          summary: "Parent signed in on mobile app (mobile)",
          metadata: { client: "mobile", platform: "ios" },
        }),
      ),
      "A parent signed in for Rooted Meadows Waldorf School (Mobile (ios))",
    );
  });
});

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

  it("uses message sender metadata for message events", () => {
    assert.equal(
      resolveActorDisplayLabel(
        baseEvent({
          action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
          actor_type: "system",
          summary: "Parent: Hello there",
          metadata: { senderName: "Jane Doe" },
        }),
      ),
      "Jane Doe",
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

  it("shows API error summaries directly instead of a generic phrase", () => {
    assert.equal(
      formatActivityEventNarrative(
        baseEvent({
          actor_type: "system",
          action: ACTIVITY_ACTIONS.API_ERROR,
          summary:
            "POST /api/stripe/webhook returned 500: Webhook handler failed. — duplicate key value",
        }),
      ),
      "POST /api/stripe/webhook returned 500: Webhook handler failed. — duplicate key value",
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

  it("formats message events with sender, school, recipients, and preview", () => {
    assert.equal(
      formatActivityEventNarrative(
        baseEvent({
          action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
          actor_type: "parent",
          summary: "Can we reschedule?",
          metadata: {
            senderName: "Jane Doe",
            recipientLabels: ["Rooted Meadows Waldorf School Office"],
            preview: "Can we reschedule?",
          },
        }),
      ),
      "Jane Doe from Rooted Meadows Waldorf School messaged Rooted Meadows Waldorf School Office: Can we reschedule?",
    );
  });

  it("joins multiple message recipients with and", () => {
    assert.equal(
      formatActivityEventNarrative(
        baseEvent({
          action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
          actor_type: "parent",
          summary: "Quick question",
          metadata: {
            senderName: "Jane Doe",
            recipientLabels: ["Ms. Smith", "Rooted Meadows Waldorf School Office"],
            preview: "Quick question",
          },
        }),
      ),
      "Jane Doe from Rooted Meadows Waldorf School messaged Ms. Smith and Rooted Meadows Waldorf School Office: Quick question",
    );
  });

  it("parses legacy message summaries with sender prefix", () => {
    assert.equal(
      formatActivityEventNarrative(
        baseEvent({
          action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
          actor_type: "system",
          summary: "Parent: I had a quick item to bring up",
          metadata: {
            recipientLabels: ["Rooted Meadows Waldorf School Office"],
            preview: "I had a quick item to bring up",
          },
        }),
      ),
      "Parent from Rooted Meadows Waldorf School messaged Rooted Meadows Waldorf School Office: I had a quick item to bring up",
    );
  });

  it("falls back when message recipient metadata is missing", () => {
    assert.equal(
      formatActivityEventNarrative(
        baseEvent({
          action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
          actor_type: "system",
          summary: "Hello there",
          metadata: { preview: "Hello there" },
        }),
        { displayActorName: "System", displayActorEmail: null },
      ),
      "System sent a message for Rooted Meadows Waldorf School: Hello there",
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

  it("uses message icon for message events", () => {
    const visual = getActivityEventVisual(
      baseEvent({
        action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
        severity: "info",
      }),
    );
    assert.equal(visual.Icon, MessageSquare);
    assert.match(visual.className, /sky/);
  });
});
