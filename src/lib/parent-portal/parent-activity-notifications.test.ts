import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  countUnreadParentActivityNotifications,
  getParentActivityNotificationCategory,
  formatRelativeTime,
  MAX_UNREAD_BADGE_COUNT,
  resolveNotificationSince,
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
