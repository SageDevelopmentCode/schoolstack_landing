import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import type { CommitteeActivityEventRow } from "@/lib/committees/activity-feed";
import {
  buildDigestCommitteeGroups,
  filterDigestEventsForMember,
  formatDigestOccurredAtLabel,
  mapDigestActivityItem,
} from "./daily-digest-utils";

const REFERENCE_DATE = new Date("2026-09-22T20:00:00.000Z");

function event(
  overrides: Partial<CommitteeActivityEventRow> & {
    action: string;
    summary: string;
  },
): CommitteeActivityEventRow {
  return {
    id: overrides.id ?? "event-1",
    organization_id: overrides.organization_id ?? "org-1",
    actor_name: overrides.actor_name ?? "Admin",
    action: overrides.action,
    summary: overrides.summary,
    metadata: overrides.metadata ?? {
      committeeId: "committee-1",
      committeeName: "Farm Committee",
    },
    created_at: overrides.created_at ?? "2026-09-22T12:00:00.000Z",
  };
}

describe("mapDigestActivityItem", () => {
  it("maps calendar create with title and formatted date", () => {
    const item = mapDigestActivityItem(
      event({
        action: ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED,
        summary: 'Calendar event "Harvest festival planning" was added',
        actor_name: "Ms. Taylor Reyes",
        created_at: "2026-09-21T15:15:00.000Z",
        metadata: {
          committeeId: "committee-1",
          committeeName: "Farm Committee",
          eventTitle: "Harvest festival planning",
          eventDate: "2026-09-27",
        },
      }),
      REFERENCE_DATE,
    );

    assert.equal(item.title, "Harvest festival planning");
    assert.equal(item.actionLabel, "Added");
    assert.match(item.details[0], /September 27, 2026/);
    assert.equal(item.actorName, "Ms. Taylor Reyes");
    assert.match(item.occurredAtLabel, /^Yesterday at /);
  });

  it("maps member invite with name and role", () => {
    const item = mapDigestActivityItem(
      event({
        action: ACTIVITY_ACTIONS.COMMITTEE_MEMBER_INVITED,
        summary: "Holly Evensen was invited to the committee",
        metadata: {
          committeeId: "committee-1",
          committeeName: "Farm Committee",
          memberName: "Holly Evensen",
          memberRole: "member",
        },
      }),
      REFERENCE_DATE,
    );

    assert.equal(item.title, "Holly Evensen");
    assert.equal(item.actionLabel, "Invited");
    assert.deepEqual(item.details, ["Member"]);
  });

  it("maps task update with due date detail", () => {
    const item = mapDigestActivityItem(
      event({
        action: ACTIVITY_ACTIONS.COMMITTEE_TASK_UPDATED,
        summary: 'Task "Order compost" was updated',
        metadata: {
          committeeId: "committee-1",
          committeeName: "Farm Committee",
          taskTitle: "Order compost",
          changes: { dueDate: "2026-09-26" },
        },
      }),
      REFERENCE_DATE,
    );

    assert.equal(item.title, "Order compost");
    assert.equal(item.actionLabel, "Updated");
    assert.match(item.details[0], /September 26, 2026/);
  });

  it("maps message posted with preview text", () => {
    const item = mapDigestActivityItem(
      event({
        action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
        summary: 'New message posted: "Can someone cover setup?"',
        metadata: {
          committeeId: "committee-1",
          committeeName: "Farm Committee",
          messagePreview: "Can someone cover setup?",
        },
      }),
      REFERENCE_DATE,
    );

    assert.equal(item.title, "Can someone cover setup?");
    assert.equal(item.actionLabel, "Posted");
    assert.deepEqual(item.details, []);
  });

  it("falls back to summary when metadata is sparse", () => {
    const item = mapDigestActivityItem(
      event({
        action: ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_DELETED,
        summary: 'Resource "Volunteer handbook" was deleted',
        metadata: {
          committeeId: "committee-1",
          committeeName: "Farm Committee",
        },
      }),
      REFERENCE_DATE,
    );

    assert.equal(item.title, "Volunteer handbook");
    assert.equal(item.actionLabel, "Removed");
    assert.deepEqual(item.details, []);
  });
});

describe("formatDigestOccurredAtLabel", () => {
  it("labels same-day activity as Today", () => {
    const label = formatDigestOccurredAtLabel(
      "2026-09-22T08:12:00.000Z",
      REFERENCE_DATE,
    );
    assert.match(label, /^Today at /);
  });
});

describe("filterDigestEventsForMember", () => {
  const events = [
    event({
      id: "task-created",
      action: ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
      summary: "Task created",
      metadata: {
        committeeId: "committee-1",
        committeeName: "Farm Committee",
        actorMemberId: "member-2",
      },
    }),
    event({
      id: "own-message",
      action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
      summary: "Own message",
      metadata: {
        committeeId: "committee-1",
        committeeName: "Farm Committee",
        actorMemberId: "member-1",
      },
    }),
    event({
      id: "assigned",
      action: ACTIVITY_ACTIONS.COMMITTEE_TASK_ASSIGNED,
      summary: "Task assigned",
      metadata: {
        committeeId: "committee-1",
        committeeName: "Farm Committee",
        actorMemberId: "member-2",
      },
    }),
    event({
      id: "other-committee",
      action: ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED,
      summary: "Other committee resource",
      metadata: {
        committeeId: "committee-2",
        committeeName: "Garden Committee",
      },
    }),
  ];

  it("keeps relevant committee activity and excludes own actions and assignments", () => {
    const filtered = filterDigestEventsForMember(events, {
      memberIds: ["member-1"],
      committeeIds: ["committee-1"],
    });

    assert.deepEqual(
      filtered.map((item) => item.id),
      ["task-created"],
    );
  });

  it("merges activity across multiple committees for the same person", () => {
    const filtered = filterDigestEventsForMember(
      [
        event({
          id: "farm-task",
          action: ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
          summary: "Farm task created",
          metadata: {
            committeeId: "committee-1",
            committeeName: "Farm Committee",
            actorMemberId: "member-2",
          },
        }),
        event({
          id: "garden-message",
          action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
          summary: 'New message posted: "Garden update"',
          metadata: {
            committeeId: "committee-2",
            committeeName: "Garden Committee",
            messagePreview: "Garden update",
          },
        }),
        event({
          id: "own-garden-message",
          action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
          summary: "Own garden message",
          metadata: {
            committeeId: "committee-2",
            committeeName: "Garden Committee",
            actorMemberId: "member-garden",
          },
        }),
      ],
      {
        memberIds: ["member-farm", "member-garden"],
        committeeIds: ["committee-1", "committee-2"],
      },
    );

    assert.deepEqual(
      filtered.map((item) => item.id),
      ["farm-task", "garden-message"],
    );
  });
});

describe("buildDigestCommitteeGroups", () => {
  it("groups activity by committee and category with structured items", () => {
    const groups = buildDigestCommitteeGroups(
      [
        event({
          id: "message",
          action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
          summary: 'New message posted: "Hello team"',
          actor_name: "Holly Evensen",
          metadata: {
            committeeId: "committee-1",
            committeeName: "Farm Committee",
            messagePreview: "Hello team",
          },
        }),
        event({
          id: "member",
          action: ACTIVITY_ACTIONS.COMMITTEE_MEMBER_INVITED,
          summary: "Holly was invited",
          metadata: {
            committeeId: "committee-1",
            committeeName: "Farm Committee",
            memberName: "Holly Evensen",
            memberRole: "member",
          },
        }),
        event({
          id: "garden-task",
          action: ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
          summary: 'Task "Water seedlings" was created',
          metadata: {
            committeeId: "committee-2",
            committeeName: "Garden Committee",
            taskTitle: "Water seedlings",
            taskStatus: "open",
          },
        }),
      ],
      REFERENCE_DATE,
    );

    assert.equal(groups.length, 2);
    assert.equal(groups[0].committeeName, "Farm Committee");
    assert.deepEqual(
      groups[0].categories.map((category) => category.category),
      ["Members", "Messages"],
    );
    assert.equal(groups[0].categories[0].items[0].title, "Holly Evensen");
    assert.equal(groups[0].categories[0].items[0].actionLabel, "Invited");
    assert.equal(groups[0].categories[1].items[0].title, "Hello team");
    assert.deepEqual(groups[0].categories[1].items[0].details, []);
    assert.equal(groups[1].committeeName, "Garden Committee");
    assert.equal(groups[1].categories[0].items[0].title, "Water seedlings");
    assert.equal(groups[1].categories[0].items[0].actionLabel, "Added");
  });

  it("returns an empty array when there is no activity", () => {
    assert.deepEqual(buildDigestCommitteeGroups([]), []);
  });
});
