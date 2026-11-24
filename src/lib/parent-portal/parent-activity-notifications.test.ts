import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  countUnreadParentActivityNotifications,
  filterParentActivityEventsForFamily,
  getParentActivityNotificationCategory,
  formatRelativeTime,
  MAX_UNREAD_BADGE_COUNT,
  resolveNotificationSince,
  resolveTeacherParentFormPublishedLink,
} from "@/lib/parent-portal/parent-activity-notifications";
import {
  getActivityNotificationRangeStart,
  isUnreadActivityNotificationEvent,
} from "@/lib/school-admin/activity-notifications";

describe("getParentActivityNotificationCategory", () => {
  it("maps message actions to messages", () => {
    assert.equal(
      getParentActivityNotificationCategory(ACTIVITY_ACTIONS.MESSAGES_RECEIVED),
      "messages",
    );
  });

  it("maps bulletin synthetic action to announcements", () => {
    assert.equal(
      getParentActivityNotificationCategory("bulletin.post_published"),
      "announcements",
    );
  });

  it("maps school gallery uploads to announcements", () => {
    assert.equal(
      getParentActivityNotificationCategory(
        ACTIVITY_ACTIONS.SCHOOL_GALLERY_PHOTOS_UPLOADED,
      ),
      "announcements",
    );
  });

  it("maps calendar synthetic action to events", () => {
    assert.equal(
      getParentActivityNotificationCategory("calendar.event_posted"),
      "events",
    );
  });

  it("maps tuition actions to payments", () => {
    assert.equal(
      getParentActivityNotificationCategory(ACTIVITY_ACTIONS.TUITION_AUTOPAY_FAILED),
      "payments",
    );
  });

  it("maps co-op synthetic actions to coop", () => {
    assert.equal(
      getParentActivityNotificationCategory("coop.curriculum.updated"),
      "coop",
    );
  });

  it("maps teacher parent form actions to other", () => {
    assert.equal(
      getParentActivityNotificationCategory(
        ACTIVITY_ACTIONS.TEACHER_PARENT_FORM_PUBLISHED,
      ),
      "other",
    );
  });
});

describe("resolveTeacherParentFormPublishedLink", () => {
  const parentBase = "/school/demo/parent";

  it("routes tuition forms to billing agreements", () => {
    const link = resolveTeacherParentFormPublishedLink(
      parentBase,
      "form-tuition-1",
      "tuition",
    );
    assert.equal(
      link.href,
      "/school/demo/parent/billing?tab=agreements&form=form-tuition-1",
    );
    assert.equal(link.ctaLabel, "View agreement");
  });

  it("routes general forms to forms_documents", () => {
    const link = resolveTeacherParentFormPublishedLink(
      parentBase,
      "form-general-1",
      "general",
    );
    assert.equal(
      link.href,
      "/school/demo/parent/forms_documents?form=form-general-1",
    );
    assert.equal(link.ctaLabel, "View form");
  });
});

describe("resolveNotificationSince", () => {
  const rangeStart = new Date("2026-08-01T00:00:00.000Z");

  it("uses rangeStart when lastReadAt is null", () => {
    const bound = resolveNotificationSince(null, rangeStart);
    assert.equal(bound.since.toISOString(), rangeStart.toISOString());
    assert.equal(bound.exclusive, false);
  });

  it("uses rangeStart when lastReadAt is before the window", () => {
    const bound = resolveNotificationSince(
      "2026-07-01T00:00:00.000Z",
      rangeStart,
    );
    assert.equal(bound.since.toISOString(), rangeStart.toISOString());
    assert.equal(bound.exclusive, false);
  });

  it("uses lastReadAt exclusively when it is inside the window", () => {
    const bound = resolveNotificationSince(
      "2026-09-01T12:00:00.000Z",
      rangeStart,
    );
    assert.equal(bound.since.toISOString(), "2026-09-01T12:00:00.000Z");
    assert.equal(bound.exclusive, true);
  });

  it("falls back to rangeStart for invalid lastReadAt", () => {
    const bound = resolveNotificationSince("not-a-date", rangeStart);
    assert.equal(bound.since.toISOString(), rangeStart.toISOString());
    assert.equal(bound.exclusive, false);
  });
});

describe("MAX_UNREAD_BADGE_COUNT", () => {
  it("caps badge counts at 99", () => {
    assert.equal(MAX_UNREAD_BADGE_COUNT, 99);
  });
});

function createUnreadCountSupabase(options: {
  activityEvents: Array<{
    id: string;
    action: string;
    created_at: string;
    entity_type?: string | null;
    entity_id?: string | null;
    summary?: string;
    metadata?: Record<string, unknown>;
    actor_type?: string | null;
    actor_user_id?: string | null;
    surface?: string | null;
  }>;
}): { supabase: SupabaseClient; createdAtFilters: string[] } {
  const createdAtFilters: string[] = [];

  function createQueryChain(resolveData: () => unknown[]) {
    const chain = {
      select() {
        return chain;
      },
      eq() {
        return chain;
      },
      in() {
        return chain;
      },
      is() {
        return chain;
      },
      not() {
        return chain;
      },
      gte(column: string, value: string) {
        if (
          column === "created_at" ||
          column === "published_at" ||
          column === "updated_at"
        ) {
          createdAtFilters.push(`gte:${value}`);
        }
        return chain;
      },
      gt(column: string, value: string) {
        if (column === "created_at") {
          createdAtFilters.push(`gt:${value}`);
        }
        return chain;
      },
      order() {
        return chain;
      },
      limit() {
        return chain;
      },
      or() {
        return chain;
      },
      then(onFulfilled: (value: { data: unknown[]; error: null }) => unknown) {
        return Promise.resolve(
          onFulfilled({ data: resolveData(), error: null }),
        );
      },
    };

    return chain;
  }

  const supabase = {
    from(table: string) {
      if (table === "activity_events") {
        return createQueryChain(() => options.activityEvents);
      }

      return createQueryChain(() => []);
    },
  } as unknown as SupabaseClient;

  return { supabase, createdAtFilters };
}

const programNotificationContext = {
  mode: "program" as const,
  slug: "school",
  programId: "program-1",
  programSlug: "program",
  parentNavBasePath: "/school/school/parent/p/program",
  applyBasePath: "/school/school/apply",
  coopModeEnabled: false,
};

describe("countUnreadParentActivityNotifications", () => {
  it("uses gt(lastReadAt) for activity event queries when watermark is recent", async () => {
    const rangeStart = getActivityNotificationRangeStart(
      30,
      new Date("2026-09-10T12:00:00.000Z"),
    );
    const lastReadAt = "2026-09-09T12:00:00.000Z";
    const { supabase, createdAtFilters } = createUnreadCountSupabase({
      activityEvents: [
        {
          id: "event-1",
          action: ACTIVITY_ACTIONS.APPLICATION_ACCEPTED,
          created_at: "2026-09-09T18:00:00.000Z",
          entity_type: "application",
          entity_id: "app-1",
          summary: "Accepted",
          metadata: { applicationId: "app-1", familyId: "family-1" },
        },
      ],
    });

    const unreadCount = await countUnreadParentActivityNotifications(
      supabase,
      "org-1",
      "school",
      "family-1",
      lastReadAt,
      {
        notificationContext: programNotificationContext,
      },
    );

    assert.equal(unreadCount, 1);
    assert.ok(
      createdAtFilters.some((filter) => filter === `gt:${lastReadAt}`),
      `expected gt filter for watermark, got ${createdAtFilters.join(", ")}`,
    );
    assert.ok(
      !createdAtFilters.some((filter) => filter === `gte:${rangeStart.toISOString()}`),
      "should not scan from full 30-day range when watermark is newer",
    );
  });

  it("caps unread counts at MAX_UNREAD_BADGE_COUNT", async () => {
    const activityEvents = Array.from({ length: 120 }, (_, index) => ({
      id: `event-${index}`,
      action: ACTIVITY_ACTIONS.APPLICATION_ACCEPTED,
      created_at: new Date(Date.now() - index * 60_000).toISOString(),
      entity_type: "application",
      entity_id: `app-${index}`,
      summary: "Accepted",
      metadata: { applicationId: `app-${index}`, familyId: "family-1" },
    }));

    const { supabase } = createUnreadCountSupabase({ activityEvents });

    const unreadCount = await countUnreadParentActivityNotifications(
      supabase,
      "org-1",
      "school",
      "family-1",
      null,
      {
        notificationContext: programNotificationContext,
      },
    );

    assert.equal(unreadCount, MAX_UNREAD_BADGE_COUNT);
  });
});

describe("parent notification unread helpers", () => {
  it("treats items after lastReadAt as unread within the window", () => {
    const rangeStart = getActivityNotificationRangeStart(30, new Date("2026-09-10T12:00:00.000Z"));
    assert.equal(
      isUnreadActivityNotificationEvent(
        "2026-09-09T12:00:00.000Z",
        "2026-09-08T12:00:00.000Z",
        rangeStart,
      ),
      true,
    );
  });

  it("treats items before lastReadAt as read", () => {
    const rangeStart = getActivityNotificationRangeStart(30, new Date("2026-09-10T12:00:00.000Z"));
    assert.equal(
      isUnreadActivityNotificationEvent(
        "2026-09-08T12:00:00.000Z",
        "2026-09-09T12:00:00.000Z",
        rangeStart,
      ),
      false,
    );
  });
});

describe("formatRelativeTime re-export", () => {
  it("returns Just now for very recent timestamps", () => {
    const now = new Date().toISOString();
    assert.equal(formatRelativeTime(now), "Just now");
  });
});

type CommitteeFilterSupabaseOptions = {
  guardians: Array<{ family_id: string; user_id: string | null }>;
  assigneeGuardians?: Array<{
    user_id: string;
    family_id: string;
    organization_id: string;
  }>;
  committeeMembers: Array<{
    id: string;
    committee_id: string;
    organization_id: string;
    user_id: string;
    status: string;
  }>;
};

function createCommitteeFilterSupabase(
  options: CommitteeFilterSupabaseOptions,
): SupabaseClient {
  function createQueryChain(resolveData: (selectColumns: string) => unknown[]) {
    let selectColumns = "";
    const chain = {
      select(columns: string) {
        selectColumns = columns;
        return chain;
      },
      eq() {
        return chain;
      },
      in() {
        return chain;
      },
      not() {
        return chain;
      },
      order() {
        return chain;
      },
      limit() {
        return chain;
      },
      maybeSingle() {
        return Promise.resolve({ data: null, error: null });
      },
      then(onFulfilled: (value: { data: unknown[]; error: null }) => unknown) {
        return Promise.resolve(
          onFulfilled({ data: resolveData(selectColumns), error: null }),
        );
      },
    };
    return chain;
  }

  return {
    from(table: string) {
      if (table === "guardians") {
        return createQueryChain((columns) => {
          if (columns.includes("family_id")) {
            return options.assigneeGuardians ?? [];
          }
          return options.guardians;
        });
      }
      if (table === "committee_members") {
        return createQueryChain(() => options.committeeMembers);
      }
      return createQueryChain(() => []);
    },
  } as unknown as SupabaseClient;
}

describe("filterParentActivityEventsForFamily org-wide gallery", () => {
  it("includes school gallery upload events for every family", async () => {
    const supabase = createCommitteeFilterSupabase({
      guardians: [{ family_id: "family-1", user_id: "guardian-1" }],
      committeeMembers: [],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      "org-1",
      "family-1",
      [
        {
          id: "gallery-1",
          action: ACTIVITY_ACTIONS.SCHOOL_GALLERY_PHOTOS_UPLOADED,
          entity_type: "school_gallery_upload_batch",
          entity_id: "batch-1",
          summary: "Jordan Taylor uploaded 3 photos for Oct 18, 2026",
          metadata: { photoCount: 3, uploaderName: "Jordan Taylor" },
          created_at: "2026-10-18T12:00:00.000Z",
        },
      ],
    );

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.action, ACTIVITY_ACTIONS.SCHOOL_GALLERY_PHOTOS_UPLOADED);
  });
});

function createSignupAudienceSupabase(options: {
  signups: Array<Record<string, unknown>>;
  /** enrollment_classrooms rows for the signup's classroom. */
  classroomEnrollments: Array<{ family_id: string; student_id: string }>;
  responses?: Array<{ signup_id: string; status: string }>;
}): SupabaseClient {
  function createQueryChain(resolveData: () => unknown[]) {
    const chain = {
      select() {
        return chain;
      },
      eq() {
        return chain;
      },
      in() {
        return chain;
      },
      not() {
        return chain;
      },
      order() {
        return chain;
      },
      limit() {
        return chain;
      },
      maybeSingle() {
        return Promise.resolve({ data: null, error: null });
      },
      then(onFulfilled: (value: { data: unknown[]; error: null }) => unknown) {
        return Promise.resolve(onFulfilled({ data: resolveData(), error: null }));
      },
    };
    return chain;
  }

  return {
    from(table: string) {
      if (table === "classroom_signups") {
        return createQueryChain(() => options.signups);
      }
      if (table === "classroom_signup_responses") {
        return createQueryChain(() => options.responses ?? []);
      }
      if (table === "enrollment_classrooms") {
        return createQueryChain(() =>
          options.classroomEnrollments.map((row) => ({
            enrollments: {
              student_id: row.student_id,
              status: "enrolled",
              students: { family_id: row.family_id },
            },
          })),
        );
      }
      return createQueryChain(() => []);
    },
  } as unknown as SupabaseClient;
}

describe("filterParentActivityEventsForFamily classroom signups", () => {
  const signupRow = (status: string) => ({
    id: "signup-1",
    organization_id: "org-1",
    title: "Snack Time",
    status,
    audience: "classrooms",
    classroom_id: null,
    classroom_ids: ["classroom-meraki"],
    created_by_staff_member_id: "staff-1",
    staff_members: { first_name: "Rachael", last_name: "S" },
    classrooms: null,
  });

  const signupEvent = (action: string) => ({
    id: `event-${action}`,
    action,
    entity_type: "classroom_signup",
    entity_id: "signup-1",
    summary: 'Rachael published "Snack Time"',
    metadata: { signupId: "signup-1", signupTitle: "Snack Time" },
    created_at: "2026-11-23T22:28:00.000Z",
  });

  it("shows a published signup to a family in its classroom", async () => {
    const supabase = createSignupAudienceSupabase({
      signups: [signupRow("open")],
      classroomEnrollments: [{ family_id: "family-meraki", student_id: "s-1" }],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      "org-1",
      "family-meraki",
      [signupEvent(ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED)],
    );

    assert.equal(filtered.length, 1);
  });

  it("hides a published signup from a family outside its audience", async () => {
    const supabase = createSignupAudienceSupabase({
      signups: [signupRow("open")],
      classroomEnrollments: [{ family_id: "family-meraki", student_id: "s-1" }],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      "org-1",
      "family-other",
      [signupEvent(ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED)],
    );

    assert.equal(filtered.length, 0);
  });

  it("hides signup events when the signup no longer exists or is a draft", async () => {
    const supabase = createSignupAudienceSupabase({
      signups: [],
      classroomEnrollments: [{ family_id: "family-meraki", student_id: "s-1" }],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      "org-1",
      "family-meraki",
      [signupEvent(ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_PUBLISHED)],
    );

    assert.equal(filtered.length, 0);
  });

  it("shows a closed signup only to an audience family that signed up", async () => {
    const closedEvent = signupEvent(ACTIVITY_ACTIONS.CLASSROOM_SIGNUP_CLOSED);

    const notSignedUp = await filterParentActivityEventsForFamily(
      createSignupAudienceSupabase({
        signups: [signupRow("closed")],
        classroomEnrollments: [{ family_id: "family-meraki", student_id: "s-1" }],
      }),
      "org-1",
      "family-meraki",
      [closedEvent],
    );
    assert.equal(notSignedUp.length, 0);

    const signedUp = await filterParentActivityEventsForFamily(
      createSignupAudienceSupabase({
        signups: [signupRow("closed")],
        classroomEnrollments: [{ family_id: "family-meraki", student_id: "s-1" }],
        responses: [{ signup_id: "signup-1", status: "confirmed" }],
      }),
      "org-1",
      "family-meraki",
      [closedEvent],
    );
    assert.equal(signedUp.length, 1);
  });
});

describe("filterParentActivityEventsForFamily committee broadcasts", () => {
  const organizationId = "org-1";
  const familyId = "family-1";
  const committeeId = "committee-1";
  const guardianUserId = "guardian-user-1";
  const memberId = "member-1";

  const baseEvent = {
    id: "event-1",
    action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
    entity_type: "committee_message",
    entity_id: "message-1",
    summary: 'New message posted: "Hello"',
    metadata: {
      committeeId,
      committeeName: "Hospitality",
      actorMemberId: "other-member",
    },
    created_at: "2026-09-10T12:00:00.000Z",
  };

  it("includes broadcast committee events when the family has an active member", async () => {
    const supabase = createCommitteeFilterSupabase({
      guardians: [{ family_id: familyId, user_id: guardianUserId }],
      committeeMembers: [
        {
          id: memberId,
          committee_id: committeeId,
          organization_id: organizationId,
          user_id: guardianUserId,
          status: "active",
        },
      ],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      organizationId,
      familyId,
      [baseEvent],
    );

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.id, "event-1");
  });

  it("excludes broadcast committee events when the family is not on the committee", async () => {
    const supabase = createCommitteeFilterSupabase({
      guardians: [{ family_id: familyId, user_id: guardianUserId }],
      committeeMembers: [],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      organizationId,
      familyId,
      [baseEvent],
    );

    assert.equal(filtered.length, 0);
  });

  it("excludes broadcast events when the family member was the actor (email parity)", async () => {
    const supabase = createCommitteeFilterSupabase({
      guardians: [{ family_id: familyId, user_id: guardianUserId }],
      committeeMembers: [
        {
          id: memberId,
          committee_id: committeeId,
          organization_id: organizationId,
          user_id: guardianUserId,
          status: "active",
        },
      ],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      organizationId,
      familyId,
      [
        {
          ...baseEvent,
          metadata: {
            ...baseEvent.metadata,
            actorMemberId: memberId,
          },
        },
      ],
    );

    assert.equal(filtered.length, 0);
  });

  it("keeps COMMITTEE_TASK_ASSIGNED when the assignee is in the family", async () => {
    const assigneeUserId = "assignee-user";
    const supabase = createCommitteeFilterSupabase({
      guardians: [
        { family_id: familyId, user_id: guardianUserId },
        { family_id: familyId, user_id: assigneeUserId },
      ],
      assigneeGuardians: [
        {
          user_id: assigneeUserId,
          family_id: familyId,
          organization_id: organizationId,
        },
      ],
      committeeMembers: [],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      organizationId,
      familyId,
      [
        {
          id: "task-assigned-1",
          action: ACTIVITY_ACTIONS.COMMITTEE_TASK_ASSIGNED,
          entity_type: "committee_task",
          entity_id: "task-1",
          summary: "Task assigned",
          metadata: {
            committeeId,
            assigneeUserId,
          },
          created_at: "2026-09-10T12:00:00.000Z",
        },
      ],
    );

    assert.equal(filtered.length, 1);
  });

  it("excludes COMMITTEE_TASK_ASSIGNED when the assignee is not in the family", async () => {
    const supabase = createCommitteeFilterSupabase({
      guardians: [{ family_id: familyId, user_id: guardianUserId }],
      assigneeGuardians: [
        {
          user_id: "other-family-user",
          family_id: "family-2",
          organization_id: organizationId,
        },
      ],
      committeeMembers: [],
    });

    const filtered = await filterParentActivityEventsForFamily(
      supabase,
      organizationId,
      familyId,
      [
        {
          id: "task-assigned-1",
          action: ACTIVITY_ACTIONS.COMMITTEE_TASK_ASSIGNED,
          entity_type: "committee_task",
          entity_id: "task-1",
          summary: "Task assigned",
          metadata: {
            committeeId,
            assigneeUserId: "other-family-user",
          },
          created_at: "2026-09-10T12:00:00.000Z",
        },
      ],
    );

    assert.equal(filtered.length, 0);
  });
});
