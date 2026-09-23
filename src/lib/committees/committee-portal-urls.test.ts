import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { committeeTaskAssigneeTasksPath } from "./committee-portal-urls";

describe("committeeTaskAssigneeTasksPath", () => {
  it("uses teacher portal when assignee has staff_member_id even with user_id", () => {
    const path = committeeTaskAssigneeTasksPath("rooted-meadows", "committee-1", {
      staff_member_id: "staff-1",
      user_id: "user-1",
    });

    assert.match(path, /^\/school\/rooted-meadows\/teacher\/committees\?/);
    assert.match(path, /committee=committee-1/);
    assert.match(path, /section=tasks/);
    assert.match(path, /tab=mine/);
  });

  it("uses parent portal when assignee has user_id only", () => {
    const path = committeeTaskAssigneeTasksPath("rooted-meadows", "committee-1", {
      user_id: "user-1",
    });

    assert.match(path, /^\/school\/rooted-meadows\/parent\/committees\?/);
    assert.match(path, /committee=committee-1/);
    assert.match(path, /section=tasks/);
    assert.match(path, /tab=mine/);
  });

  it("uses parent portal when assignee has guardian_id only", () => {
    const path = committeeTaskAssigneeTasksPath("rooted-meadows", "committee-1", {
      guardian_id: "guardian-1",
    });

    assert.match(path, /^\/school\/rooted-meadows\/parent\/committees\?/);
  });

  it("uses school admin portal for email-only committee contacts", () => {
    const path = committeeTaskAssigneeTasksPath("rooted-meadows", "committee-1", {});

    assert.equal(
      path,
      "/school/rooted-meadows/admin/committees?committee=committee-1&section=tasks",
    );
  });
});
