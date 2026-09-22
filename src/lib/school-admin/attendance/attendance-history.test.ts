import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAttendanceHistorySummary,
  formatAttendanceHistoryDateLabel,
  formatAttendanceHistoryFullDateLabel,
  formatAttendanceHistoryTime,
  mapAttendanceHistoryRow,
  resolveAttendanceHistoryActor,
} from "./attendance-history";

const baseEntry = {
  date: "2026-09-20",
  status: "present" as const,
  presentAt: "2026-09-20T12:47:00.000Z",
  absentAt: null,
  pickedUpAt: null,
  pickedUpByName: null,
  recordedByUserId: "user-1",
  recordedByName: "Jane Admin",
  recordedByPhotoUrl: "https://example.com/jane.jpg",
};

describe("attendance history", () => {
  it("formats history dates and times", () => {
    assert.equal(formatAttendanceHistoryDateLabel("2026-09-20"), "Sun, Sep 20");
    assert.equal(
      formatAttendanceHistoryFullDateLabel("2026-09-20"),
      "Sunday, September 20, 2026",
    );
    assert.equal(
      formatAttendanceHistoryTime("2026-09-20T14:30:00.000Z"),
      new Date("2026-09-20T14:30:00.000Z").toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    );
    assert.equal(formatAttendanceHistoryTime(null), null);
  });

  it("maps attendance history rows with staff recorder", () => {
    const staffByUserId = new Map([
      [
        "user-1",
        {
          user_id: "user-1",
          first_name: "Jane",
          last_name: "Admin",
          profile_photo_url: "https://example.com/jane.jpg",
        },
      ],
    ]);

    const entry = mapAttendanceHistoryRow(
      {
        attendance_date: "2026-09-20",
        status: "picked_up",
        present_at: "2026-09-20T13:00:00.000Z",
        absent_at: null,
        picked_up_at: "2026-09-20T15:00:00.000Z",
        picked_up_by_name: "Maria Lopez",
        recorded_by_user_id: "user-1",
      },
      staffByUserId,
    );

    assert.equal(entry.recordedByName, "Jane Admin");
    assert.equal(entry.recordedByPhotoUrl, "https://example.com/jane.jpg");
    assert.equal(entry.pickedUpByName, "Maria Lopez");
  });

  it("resolves actor for present vs picked up", () => {
    assert.deepEqual(resolveAttendanceHistoryActor(baseEntry), {
      name: "Jane Admin",
      photoUrl: "https://example.com/jane.jpg",
    });

    assert.deepEqual(
      resolveAttendanceHistoryActor({
        ...baseEntry,
        status: "picked_up",
        pickedUpByName: "Maria Lopez",
      }),
      {
        name: "Maria Lopez",
        photoUrl: null,
      },
    );

    assert.deepEqual(
      resolveAttendanceHistoryActor({
        ...baseEntry,
        recordedByName: null,
        recordedByPhotoUrl: null,
      }),
      {
        name: "School staff",
        photoUrl: null,
      },
    );
  });

  it("builds attendance history summary lines", () => {
    const summary = buildAttendanceHistorySummary(baseEntry);

    assert.match(summary.primary, /^Marked present · /);
    assert.match(summary.secondary, /^Sun, Sep 20 · Jane Admin$/);

    const pickupSummary = buildAttendanceHistorySummary({
      ...baseEntry,
      status: "picked_up",
      pickedUpAt: "2026-09-20T15:00:00.000Z",
      pickedUpByName: "Maria Lopez",
    });

    assert.match(pickupSummary.primary, /^Picked up · /);
    assert.match(pickupSummary.secondary, /Maria Lopez$/);
  });
});
