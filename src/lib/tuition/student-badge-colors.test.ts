import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  buildStudentColorIndexMap,
  getStudentBadgeColors,
} from "./student-badge-colors";

function theme(): AdminThemeTokens {
  return {
    bg: "#fff",
    surface: "#fff",
    elevated: "#f5f5f5",
    input: "#fff",
    inputBorder: "#ddd",
    border: "#ddd",
    borderStrong: "#ccc",
    accent: "#2563EB",
    accentBright: "#3B82F6",
    accentLight: "rgba(37, 99, 235, 0.1)",
    secondaryBtnBorder: "#CBD5E1",
    accentGlow: "rgba(37, 99, 235, 0.2)",
    accentMid: "#1D4ED8",
    accentDark: "#1E40AF",
    clay: "#B45309",
    clayBg: "rgba(180, 83, 9, 0.08)",
    clayBorder: "rgba(180, 83, 9, 0.25)",
    textPrimary: "#111",
    textSecondary: "#444",
    textTertiary: "#666",
    textQuaternary: "#888",
    success: "#16A34A",
    successBg: "rgba(22, 163, 74, 0.08)",
    successBorder: "rgba(22, 163, 74, 0.25)",
    warning: "#D97706",
    warningBg: "rgba(217, 119, 6, 0.08)",
    warningBorder: "rgba(217, 119, 6, 0.25)",
    error: "#DC2626",
    errorBg: "rgba(220, 38, 38, 0.08)",
    errorBorder: "rgba(220, 38, 38, 0.25)",
    info: "#0284C7",
    infoBg: "rgba(2, 132, 199, 0.08)",
    infoBorder: "rgba(2, 132, 199, 0.25)",
    shadowCard: "none",
    shadowMedium: "none",
    r: { sm: "3px", md: "5px", lg: "6px", xl: "8px", full: "9999px" },
  };
}

describe("buildStudentColorIndexMap", () => {
  it("assigns stable indices sorted by enrollment id", () => {
    const map = buildStudentColorIndexMap(["enrollment-c", "enrollment-a", "enrollment-b"]);
    assert.equal(map.get("enrollment-a"), 0);
    assert.equal(map.get("enrollment-b"), 1);
    assert.equal(map.get("enrollment-c"), 2);
  });

  it("deduplicates enrollment ids", () => {
    const map = buildStudentColorIndexMap(["enrollment-a", "enrollment-a"]);
    assert.equal(map.size, 1);
    assert.equal(map.get("enrollment-a"), 0);
  });

  it("wraps palette after five children", () => {
    const ids = ["e-1", "e-2", "e-3", "e-4", "e-5", "e-6"];
    const map = buildStudentColorIndexMap(ids);
    assert.equal(map.get("e-6"), 0);
  });
});

describe("getStudentBadgeColors", () => {
  it("returns distinct colors for different indices", () => {
    const C = theme();
    const first = getStudentBadgeColors(C, 0);
    const second = getStudentBadgeColors(C, 1);
    assert.notEqual(first.color, second.color);
  });

  it("wraps negative and large indices", () => {
    const C = theme();
    assert.deepEqual(getStudentBadgeColors(C, 5), getStudentBadgeColors(C, 0));
    assert.deepEqual(getStudentBadgeColors(C, -1), getStudentBadgeColors(C, 4));
  });
});
