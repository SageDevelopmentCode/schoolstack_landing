import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import {
  mapCommitteeActivityItem,
  type CommitteeActivityEventRow,
} from "./activity-feed";

function event(
  overrides: Partial<CommitteeActivityEventRow> & {
    action: string;
    summary: string;
  },
): CommitteeActivityEventRow {
  return {
    id: overrides.id ?? "event-1",
    organization_id: overrides.organization_id ?? "org-1",
    actor_name: overrides.actor_name ?? "Parent",
    action: overrides.action,
    summary: overrides.summary,
    metadata: overrides.metadata ?? {
      committeeId: "committee-abc",
      committeeName: "Garden Committee",
    },
    created_at: overrides.created_at ?? "2026-09-22T12:00:00.000Z",
  };
}

describe("mapCommitteeActivityItem preview hrefs", () => {
  it("builds family preview parent committees URLs", () => {
    const item = mapCommitteeActivityItem(
      event({
        action: ACTIVITY_ACTIONS.COMMITTEE_MESSAGE_POSTED,
        summary: "New message in thread",
      }),
      {
        slug: "rooted-meadows",
        committeeId: "committee-abc",
        familyId: "family-xyz",
        linkSurface: "preview",
      },
    );

    assert.equal(
      item.href,
      "/admin/preview/rooted-meadows/family/family-xyz/parent/committees?committee=committee-abc&section=messages&tab=mine",
    );
  });

  it("omits href for preview surface without familyId", () => {
    const item = mapCommitteeActivityItem(
      event({
        action: ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
        summary: "Task added",
      }),
      {
        slug: "rooted-meadows",
        committeeId: "committee-abc",
        linkSurface: "preview",
      },
    );

    assert.equal(item.href, undefined);
  });

  it("still builds live parent URLs for parent surface", () => {
    const item = mapCommitteeActivityItem(
      event({
        action: ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED,
        summary: "Resource shared",
      }),
      {
        slug: "rooted-meadows",
        committeeId: "committee-abc",
        linkSurface: "parent",
      },
    );

    assert.equal(
      item.href,
      "/school/rooted-meadows/parent/committees?committee=committee-abc&section=resources&tab=mine",
    );
  });
});
