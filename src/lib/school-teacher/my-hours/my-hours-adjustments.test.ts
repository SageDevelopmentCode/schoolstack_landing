import assert from "node:assert/strict";
import test from "node:test";
import {
  adjustmentSessionsOverlap,
  defaultNextAdjustmentSession,
  parseAdjustmentSessions,
  shouldSendStaffHoursAdjustmentEmail,
  STAFF_HOURS_ADJUSTMENT_EMAIL_CAP,
} from "@/lib/school-teacher/my-hours/my-hours-adjustment-rules";
import { MyHoursMutationError } from "@/lib/school-teacher/my-hours/my-hours-mutations";

test("sends the first four adjustment emails and skips the rest", () => {
  assert.equal(shouldSendStaffHoursAdjustmentEmail(0), true);
  assert.equal(shouldSendStaffHoursAdjustmentEmail(3), true);
  assert.equal(
    shouldSendStaffHoursAdjustmentEmail(STAFF_HOURS_ADJUSTMENT_EMAIL_CAP),
    false,
  );
  assert.equal(shouldSendStaffHoursAdjustmentEmail(5), false);
});

test("parses proposed sessions into clock times", () => {
  assert.deepEqual(
    parseAdjustmentSessions([
      { clockIn: "8:00 AM", clockOut: "10:00 AM" },
      { clockIn: "10:00", clockOut: "15:00" },
    ]),
    [
      { clockIn: "08:00", clockOut: "10:00" },
      { clockIn: "10:00", clockOut: "15:00" },
    ],
  );
});

test("rejects overlapping sessions", () => {
  assert.throws(
    () =>
      parseAdjustmentSessions([
        { clockIn: "08:00", clockOut: "10:00" },
        { clockIn: "09:00", clockOut: "11:00" },
      ]),
    (error: unknown) =>
      error instanceof MyHoursMutationError &&
      error.code === "invalid_sessions" &&
      error.message === "Sessions can't overlap.",
  );
});

test("detects overlap in draft sessions", () => {
  assert.equal(adjustmentSessionsOverlap([{ clockIn: "08:00", clockOut: "10:00" }]), false);
  assert.equal(
    adjustmentSessionsOverlap([
      { clockIn: "08:00", clockOut: "10:00" },
      { clockIn: "10:00", clockOut: "12:00" },
    ]),
    false,
  );
  assert.equal(
    adjustmentSessionsOverlap([
      { clockIn: "08:00", clockOut: "10:00" },
      { clockIn: "09:00", clockOut: "11:00" },
    ]),
    true,
  );
});

test("seeds the next session after the latest clock-out", () => {
  assert.deepEqual(defaultNextAdjustmentSession([]), {
    clockIn: "08:00",
    clockOut: "15:00",
  });
  assert.deepEqual(
    defaultNextAdjustmentSession([{ clockIn: "08:00", clockOut: "11:30" }]),
    { clockIn: "11:30", clockOut: "18:30" },
  );
});

test("rejects a session that ends before it starts", () => {
  assert.throws(
    () => parseAdjustmentSessions([{ clockIn: "15:00", clockOut: "08:00" }]),
    (error: unknown) =>
      error instanceof MyHoursMutationError && error.code === "invalid_sessions",
  );
});
