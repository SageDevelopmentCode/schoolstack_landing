import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { formatActivityEventNarrative } from "@/lib/activity-event-display";

describe("formatActivityEventNarrative tuition and forms", () => {
  it("uses assignment change lines for tuition assignment events", () => {
    const narrative = formatActivityEventNarrative(
      {
        id: "event-1",
        organization_id: "org-1",
        actor_type: "school_admin",
        actor_user_id: "user-1",
        actor_email: "admin@school.org",
        actor_name: "Admin User",
        surface: "school_admin",
        action: ACTIVITY_ACTIONS.TUITION_ASSIGNMENT_CREATED,
        entity_type: "tuition_enrollment_assignment",
        entity_id: "assignment-1",
        summary: "Assigned tuition",
        metadata: {
          changes: [
            'Assigned "Annual Tuition" to Maya Chen (Nguyen family)',
          ],
        },
        severity: "info",
        created_at: "2026-10-01T12:00:00.000Z",
        organizations: {
          id: "org-1",
          slug: "rooted-meadows",
          name: "Rooted Meadows Waldorf School",
        },
      },
      {
        displayActorName: "Admin User",
        displayActorEmail: "admin@school.org",
        resolvedActorName: "Admin User",
      },
    );

    assert.match(
      narrative,
      /Admin User assigned "Annual Tuition" to Maya Chen \(Nguyen family\) for Rooted Meadows Waldorf School/,
    );
  });

  it("includes form title for teacher form published events", () => {
    const narrative = formatActivityEventNarrative(
      {
        id: "event-2",
        organization_id: "org-1",
        actor_type: "teacher",
        actor_user_id: "user-2",
        actor_email: "teacher@school.org",
        actor_name: "Taylor Reed",
        surface: "teacher_portal",
        action: ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED,
        entity_type: "teacher_parent_form",
        entity_id: "form-1",
        summary: 'Taylor Reed posted "Field Trip Permission" for your family to sign',
        metadata: {
          formTitle: "Field Trip Permission",
          teacherName: "Taylor Reed",
        },
        severity: "info",
        created_at: "2026-10-01T12:00:00.000Z",
        organizations: {
          id: "org-1",
          slug: "rooted-meadows",
          name: "Rooted Meadows Waldorf School",
        },
      },
      {
        displayActorName: "Taylor Reed",
        displayActorEmail: "teacher@school.org",
        resolvedActorName: "Taylor Reed",
      },
    );

    assert.match(narrative, /Field Trip Permission/);
    assert.match(narrative, /Rooted Meadows Waldorf School/);
  });

  it("shows payer and amount for tuition payment completed events", () => {
    const narrative = formatActivityEventNarrative(
      {
        id: "event-3",
        organization_id: "org-1",
        actor_type: "parent",
        actor_user_id: null,
        actor_email: null,
        actor_name: null,
        surface: "parent_portal",
        action: ACTIVITY_ACTIONS.TUITION_PAYMENT_COMPLETED,
        entity_type: "tuition_charge",
        entity_id: "charge-1",
        summary: "Tuition payment completed",
        metadata: {
          amountCents: 120000,
          familyName: "Nguyen family",
          payerLabel: "Jane Nguyen",
        },
        severity: "info",
        created_at: "2026-10-01T12:00:00.000Z",
        organizations: {
          id: "org-1",
          slug: "rooted-meadows",
          name: "Rooted Meadows Waldorf School",
        },
      },
      {
        displayActorName: "A parent",
        tuitionContext: {
          subjectLabel: "Maya N.",
          chargeLabel: "March tuition",
          familyName: "Nguyen family",
          studentName: "Maya Chen",
          payerLabel: "Jane Nguyen",
        },
      },
    );

    assert.doesNotMatch(narrative, /A parent completed a tuition payment/);
    assert.match(narrative, /Jane Nguyen paid \$1,200 for Maya C\./);
  });
});
