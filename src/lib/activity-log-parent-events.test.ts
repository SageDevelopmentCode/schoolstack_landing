import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  shouldLogCoopSupplyActivity,
  shouldLogCoopTeachingWeekActivity,
} from "@/lib/admissions/program-coop-activity";
import { ACTIVITY_ACTIONS, formatActivityActionLabel } from "@/lib/activity-log";
import { formatActivityActionPhrase } from "@/lib/activity-event-display";
import { shouldLogBulletinPostPublished } from "@/lib/school-bulletin/bulletin-activity";

describe("shouldLogBulletinPostPublished", () => {
  it("logs when a post is first created as published", () => {
    assert.equal(shouldLogBulletinPostPublished(undefined, "published"), true);
  });

  it("logs on draft to published transition", () => {
    assert.equal(shouldLogBulletinPostPublished("draft", "published"), true);
  });

  it("does not log when a published post is edited without status change", () => {
    assert.equal(shouldLogBulletinPostPublished("published", "published"), false);
  });

  it("does not log when status stays draft", () => {
    assert.equal(shouldLogBulletinPostPublished("draft", "draft"), false);
  });
});

describe("co-op activity log guards", () => {
  it("skips supply activity when parent claim paths set skipActivityLog", () => {
    assert.equal(shouldLogCoopSupplyActivity(true), false);
    assert.equal(shouldLogCoopSupplyActivity(false), true);
    assert.equal(shouldLogCoopSupplyActivity(undefined), true);
  });

  it("skips teaching week activity for parent signup paths", () => {
    assert.equal(
      shouldLogCoopTeachingWeekActivity({ parentSignup: true }),
      false,
    );
    assert.equal(
      shouldLogCoopTeachingWeekActivity({ skipActivityLog: true }),
      false,
    );
    assert.equal(shouldLogCoopTeachingWeekActivity({ parentSignup: false }), true);
    assert.equal(shouldLogCoopTeachingWeekActivity(undefined), true);
  });
});

describe("parent-important activity action labels", () => {
  const actions = [
    ACTIVITY_ACTIONS.BULLETIN_POST_PUBLISHED,
    ACTIVITY_ACTIONS.CALENDAR_EVENT_POSTED,
    ACTIVITY_ACTIONS.COOP_SUPPLY_ITEM_ADDED,
    ACTIVITY_ACTIONS.COOP_SUPPLY_ITEM_UPDATED,
    ACTIVITY_ACTIONS.COOP_TEACHING_WEEK_ADDED,
    ACTIVITY_ACTIONS.COOP_TEACHING_WEEK_UPDATED,
    ACTIVITY_ACTIONS.COOP_CURRICULUM_UPDATED,
  ] as const;

  for (const action of actions) {
    it(`formats label and phrase for ${action}`, () => {
      const label = formatActivityActionLabel(action);
      const phrase = formatActivityActionPhrase(action);

      assert.notEqual(label, action);
      assert.notEqual(phrase, action);
      assert.match(label, /./);
      assert.match(phrase, /./);
    });
  }
});
