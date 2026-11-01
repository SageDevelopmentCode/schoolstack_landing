import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ACTIVITY_ACTIONS } from "@/lib/activity-log";
import { shouldSendCommitteeWorkspaceInstantNotification } from "./record-committee-activity-server";

describe("shouldSendCommitteeWorkspaceInstantNotification", () => {
  it("sends instant workspace notifications for new projects", () => {
    assert.equal(
      shouldSendCommitteeWorkspaceInstantNotification(
        ACTIVITY_ACTIONS.COMMITTEE_PROJECT_CREATED,
      ),
      true,
    );
  });

  it("sends instant workspace notifications for new supply items", () => {
    assert.equal(
      shouldSendCommitteeWorkspaceInstantNotification(
        ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_CREATED,
      ),
      true,
    );
  });

  it("still sends for other workspace create actions", () => {
    assert.equal(
      shouldSendCommitteeWorkspaceInstantNotification(
        ACTIVITY_ACTIONS.COMMITTEE_TASK_CREATED,
      ),
      true,
    );
    assert.equal(
      shouldSendCommitteeWorkspaceInstantNotification(
        ACTIVITY_ACTIONS.COMMITTEE_RESOURCE_CREATED,
      ),
      true,
    );
    assert.equal(
      shouldSendCommitteeWorkspaceInstantNotification(
        ACTIVITY_ACTIONS.COMMITTEE_EVENT_CREATED,
      ),
      true,
    );
  });

  it("does not send for project or supply updates", () => {
    assert.equal(
      shouldSendCommitteeWorkspaceInstantNotification(
        ACTIVITY_ACTIONS.COMMITTEE_PROJECT_UPDATED,
      ),
      false,
    );
    assert.equal(
      shouldSendCommitteeWorkspaceInstantNotification(
        ACTIVITY_ACTIONS.COMMITTEE_PROJECT_SUPPLY_UPDATED,
      ),
      false,
    );
  });
});
