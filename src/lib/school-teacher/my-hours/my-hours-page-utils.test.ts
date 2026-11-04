import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { activeSessionStartedAtForFocusDay } from "./my-hours-page-utils";
import type { TeacherMyHoursActiveSession } from "./types";

const session: TeacherMyHoursActiveSession = {
  entryId: "entry-1",
  workDate: "2026-11-03",
  clockInAt: "2026-11-03T23:30:00.000Z",
};

describe("activeSessionStartedAtForFocusDay", () => {
  it("returns null when there is no active session", () => {
    assert.equal(
      activeSessionStartedAtForFocusDay(null, "2026-11-04", "2026-11-04"),
      null,
    );
  });

  it("returns startedAt when focus matches work date", () => {
    const started = activeSessionStartedAtForFocusDay(
      session,
      "2026-11-03",
      "2026-11-04",
    );
    assert.deepEqual(started, new Date(session.clockInAt));
  });

  it("returns startedAt on reference today when work date is earlier (overnight)", () => {
    const started = activeSessionStartedAtForFocusDay(
      session,
      "2026-11-04",
      "2026-11-04",
    );
    assert.deepEqual(started, new Date(session.clockInAt));
  });

  it("returns null on unrelated past days", () => {
    assert.equal(
      activeSessionStartedAtForFocusDay(session, "2026-11-01", "2026-11-04"),
      null,
    );
  });
});
