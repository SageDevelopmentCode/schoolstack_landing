import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  shouldSendAttendancePickupPush,
  shouldSendAttendancePresentPush,
} from "@/lib/school-admin/attendance/attendance-push-gating";

describe("attendance push gating", () => {
  it("sends present push only when not already present or picked up", () => {
    assert.equal(shouldSendAttendancePresentPush("not_marked"), true);
    assert.equal(shouldSendAttendancePresentPush("absent"), true);
    assert.equal(shouldSendAttendancePresentPush("present"), false);
    assert.equal(shouldSendAttendancePresentPush("picked_up"), false);
  });

  it("sends pickup push only for pickup action", () => {
    assert.equal(shouldSendAttendancePickupPush("pickup"), true);
    assert.equal(shouldSendAttendancePickupPush("present"), false);
    assert.equal(shouldSendAttendancePickupPush("absent"), false);
  });
});
