import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import {
  applicationSubmissionNeedsAdminAction,
  applicationSubmissionRowStyle,
} from "./application-status-ui";

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

describe("applicationSubmissionNeedsAdminAction", () => {
  it("returns true for review-pipeline statuses", () => {
    for (const status of ["submitted", "fee_pending", "under_review", "observation"]) {
      assert.equal(applicationSubmissionNeedsAdminAction(status), true);
    }
  });

  it("returns false for non-review statuses", () => {
    for (const status of ["draft", "accepted", "enrolling", "enrolled", "declined", "withdrawn"]) {
      assert.equal(applicationSubmissionNeedsAdminAction(status), false);
    }
  });
});

describe("applicationSubmissionRowStyle", () => {
  const C = theme();

  it("uses warning styling for action-needed rows", () => {
    const style = applicationSubmissionRowStyle("submitted", C, {
      isSelected: false,
      isHovered: false,
    });

    assert.equal(style.backgroundColor, C.warningBg);
    assert.equal(style.borderLeft, `3px solid ${C.warning}`);
  });

  it("uses surface styling for enrolled rows", () => {
    const style = applicationSubmissionRowStyle("enrolled", C, {
      isSelected: false,
      isHovered: false,
    });

    assert.equal(style.backgroundColor, C.surface);
    assert.equal(style.borderLeft, "3px solid transparent");
  });

  it("uses accent styling when selected", () => {
    const style = applicationSubmissionRowStyle("submitted", C, {
      isSelected: true,
      isHovered: false,
    });

    assert.equal(style.backgroundColor, C.accentLight);
    assert.equal(style.borderLeft, `3px solid ${C.accent}`);
  });

  it("keeps warning border on hover for action-needed rows", () => {
    const style = applicationSubmissionRowStyle("under_review", C, {
      isSelected: false,
      isHovered: true,
    });

    assert.equal(style.backgroundColor, C.elevated);
    assert.equal(style.borderLeft, `3px solid ${C.warning}`);
  });
});
