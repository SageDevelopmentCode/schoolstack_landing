import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
import { buildProgramAttendanceEnabledMap } from "./program-attendance-enabled";

describe("buildProgramAttendanceEnabledMap", () => {
  it("enables attendance for inherit-mode programs when org attendance is on", () => {
    const map = buildProgramAttendanceEnabledMap(DEFAULT_FEATURES, [
      {
        id: "main-program",
        parent_portal_settings: { mode: "inherit" },
      },
    ]);

    assert.equal(map.get("main-program"), true);
  });

  it("disables attendance for isolated co-op programs with attendance false", () => {
    const map = buildProgramAttendanceEnabledMap(DEFAULT_FEATURES, [
      {
        id: "kindergarten-co-op",
        parent_portal_settings: {
          mode: "isolated",
          coop_mode: true,
          features: {
            portal: true,
            attendance: false,
            calendar: true,
            messages: true,
          },
        },
      },
    ]);

    assert.equal(map.get("kindergarten-co-op"), false);
  });

  it("enables attendance for isolated programs when org and program both allow it", () => {
    const map = buildProgramAttendanceEnabledMap(DEFAULT_FEATURES, [
      {
        id: "isolated-program",
        parent_portal_settings: {
          mode: "isolated",
          features: {
            portal: true,
            attendance: true,
          },
        },
      },
    ]);

    assert.equal(map.get("isolated-program"), true);
  });
});
