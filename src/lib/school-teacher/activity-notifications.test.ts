import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  getTeacherActivityNotificationCategory,
  isTeacherActivityEventVisible,
} from "@/lib/school-teacher/activity-notifications";

function baseContext() {
  return {
    staffMemberId: "staff-1",
    viewerUserId: "user-teacher",
    enrolledStudentIds: new Set(["student-1"]),
    threadStaffMemberIdsByThreadId: new Map([
      ["thread-1", new Set(["staff-1"])],
    ]),
  };
}

describe("getTeacherActivityNotificationCategory", () => {
  it("maps message actions to messages", () => {
    assert.equal(
      getTeacherActivityNotificationCategory(ACTIVITY_ACTIONS.MESSAGES_RECEIVED),
      "messages",
    );
  });

  it("maps signup responses to signups", () => {
    assert.equal(
      getTeacherActivityNotificationCategory(
        ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED,
      ),
      "signups",
    );
  });

  it("maps health actions to health", () => {
    assert.equal(
      getTeacherActivityNotificationCategory(
        ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED,
      ),
      "health",
    );
  });
});

describe("isTeacherActivityEventVisible", () => {
  it("includes messages when the teacher is a thread participant", () => {
    const visible = isTeacherActivityEventVisible(
      {
        id: "event-1",
        action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
        entity_type: null,
        entity_id: null,
        summary: "Parent: hello",
        metadata: {
          threadId: "thread-1",
          senderUserId: "user-parent",
        },
        created_at: "2026-09-10T12:00:00.000Z",
      },
      baseContext(),
    );

    assert.equal(visible, true);
  });

  it("excludes parent-only message events", () => {
    const visible = isTeacherActivityEventVisible(
      {
        id: "event-2",
        action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
        entity_type: null,
        entity_id: null,
        summary: "Office: hello",
        metadata: {
          threadId: "thread-1",
          recipientPortal: "parent",
        },
        created_at: "2026-09-10T12:00:00.000Z",
      },
      baseContext(),
    );

    assert.equal(visible, false);
  });

  it("excludes self-sent messages", () => {
    const visible = isTeacherActivityEventVisible(
      {
        id: "event-3",
        action: ACTIVITY_ACTIONS.MESSAGES_RECEIVED,
        entity_type: null,
        entity_id: null,
        summary: "You: hello",
        metadata: {
          threadId: "thread-1",
          senderUserId: "user-teacher",
        },
        created_at: "2026-09-10T12:00:00.000Z",
      },
      baseContext(),
    );

    assert.equal(visible, false);
  });

  it("includes classroom signup responses for the assigned teacher", () => {
    const visible = isTeacherActivityEventVisible(
      {
        id: "event-4",
        action: ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED,
        entity_type: "classroom_signup",
        entity_id: "signup-1",
        summary: "Smith family signed up",
        metadata: {
          staffMemberId: "staff-1",
          signupTitle: "Field trip",
        },
        created_at: "2026-09-10T12:00:00.000Z",
      },
      baseContext(),
    );

    assert.equal(visible, true);
  });

  it("excludes classroom signup responses for other teachers", () => {
    const visible = isTeacherActivityEventVisible(
      {
        id: "event-5",
        action: ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_RESPONSE_SUBMITTED,
        entity_type: "classroom_signup",
        entity_id: "signup-1",
        summary: "Smith family signed up",
        metadata: {
          staffMemberId: "staff-2",
        },
        created_at: "2026-09-10T12:00:00.000Z",
      },
      baseContext(),
    );

    assert.equal(visible, false);
  });

  it("includes health updates for enrolled students and excludes self-actor events", () => {
    const included = isTeacherActivityEventVisible(
      {
        id: "event-6",
        action: ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_CREATED,
        entity_type: "student_health_item",
        entity_id: "item-1",
        summary: "Parent added allergy",
        metadata: {
          studentId: "student-1",
          studentName: "Ada",
        },
        created_at: "2026-09-10T12:00:00.000Z",
        actor_user_id: "user-parent",
      },
      baseContext(),
    );

    const excluded = isTeacherActivityEventVisible(
      {
        id: "event-7",
        action: ACTIVITY_ACTIONS.STUDENT_HEALTH_ITEM_UPDATED,
        entity_type: "student_health_item",
        entity_id: "item-1",
        summary: "You updated allergy",
        metadata: {
          studentId: "student-1",
        },
        created_at: "2026-09-10T12:00:00.000Z",
        actor_user_id: "user-teacher",
      },
      baseContext(),
    );

    assert.equal(included, true);
    assert.equal(excluded, false);
  });
});
