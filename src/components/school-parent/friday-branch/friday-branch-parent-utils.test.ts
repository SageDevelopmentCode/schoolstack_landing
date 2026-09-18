import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ParentFridayBranchStudentEnrollmentState } from "@/lib/parent-portal/friday-branch/types";
import { buildParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type { OrganizationBranding } from "@/lib/organization-settings/types";
import {
  getFridayBranchChildChipAriaLabel,
  getFridayBranchChildChipPresentation,
  getInitialFridayBranchChildSelection,
  isFridayBranchChildChipDisabled,
  partitionFridayBranchChildSelection,
  syncFridayBranchChildSelection,
} from "./friday-branch-parent-utils";

const theme = buildParentThemeTokens({
  colors: {
    accent: "#5B4B8A",
    accentDark: "#4A3D72",
    accentLight: "#7A6BA8",
    accentGlow: "#5B4B8A1f",
  },
  typography: {},
} as OrganizationBranding);

const studentStates: ParentFridayBranchStudentEnrollmentState[] = [
  {
    studentId: "caleb",
    studentName: "Caleb Cecilia",
    enrollmentId: "enroll-1",
    status: "confirmed",
    canEnroll: false,
    blockedReason: "Already signed up for this class.",
  },
  {
    studentId: "jon",
    studentName: "Jon Cecilia",
    canEnroll: true,
  },
  {
    studentId: "julia",
    studentName: "Julia Cecilia",
    canEnroll: true,
  },
  {
    studentId: "blocked",
    studentName: "Blocked Child",
    canEnroll: false,
    blockedReason: "Already signed up for another class at this time.",
  },
];

describe("getInitialFridayBranchChildSelection", () => {
  it("pre-selects only enrollable children without a status", () => {
    assert.deepEqual(getInitialFridayBranchChildSelection(studentStates), ["jon", "julia"]);
  });
});

describe("partitionFridayBranchChildSelection", () => {
  it("splits selected children into enrollable and withdrawable groups", () => {
    const result = partitionFridayBranchChildSelection(
      studentStates,
      ["caleb", "jon", "julia", "blocked"],
    );
    assert.deepEqual(result.enrollableIds, ["jon", "julia"]);
    assert.deepEqual(result.withdrawableIds, ["caleb"]);
  });

  it("returns empty arrays when nothing is selected", () => {
    const result = partitionFridayBranchChildSelection(studentStates, []);
    assert.deepEqual(result.enrollableIds, []);
    assert.deepEqual(result.withdrawableIds, []);
  });
});

describe("isFridayBranchChildChipDisabled", () => {
  it("disables blocked children without an active enrollment", () => {
    assert.equal(isFridayBranchChildChipDisabled(studentStates[3]), true);
    assert.equal(isFridayBranchChildChipDisabled(studentStates[0]), false);
    assert.equal(isFridayBranchChildChipDisabled(studentStates[1]), false);
  });
});

describe("getFridayBranchChildChipAriaLabel", () => {
  it("describes enrollment status for assistive labels", () => {
    assert.equal(getFridayBranchChildChipAriaLabel(studentStates[0]), "Caleb Cecilia, signed up");
    assert.equal(
      getFridayBranchChildChipAriaLabel({
        ...studentStates[1],
        status: "waitlisted",
      }),
      "Jon Cecilia, waitlisted",
    );
    assert.equal(getFridayBranchChildChipAriaLabel(studentStates[1]), "Jon Cecilia, not signed up");
    assert.equal(getFridayBranchChildChipAriaLabel(studentStates[3]), "Blocked Child, unavailable");
  });
});

describe("getFridayBranchChildChipPresentation", () => {
  it("uses green check styling for confirmed enrollments", () => {
    const presentation = getFridayBranchChildChipPresentation(studentStates[0], false, theme);
    assert.equal(presentation.icon, "check");
    assert.equal(presentation.backgroundColor, theme.successBg);
    assert.equal(presentation.color, theme.success);
    assert.equal(presentation.borderColor, theme.success);
    assert.equal(presentation.boxShadow, undefined);
  });

  it("adds a selection ring for enrolled children selected for withdraw", () => {
    const presentation = getFridayBranchChildChipPresentation(studentStates[0], true, theme);
    assert.match(presentation.boxShadow ?? "", /0 0 0 4px/);
  });

  it("uses amber clock styling for waitlisted children", () => {
    const presentation = getFridayBranchChildChipPresentation(
      { ...studentStates[1], status: "waitlisted" },
      false,
      theme,
    );
    assert.equal(presentation.icon, "clock");
    assert.equal(presentation.backgroundColor, theme.warningBg);
    assert.equal(presentation.color, theme.warning);
    assert.equal(presentation.borderColor, theme.warning);
  });

  it("uses hollow styling for unselected enrollable children", () => {
    const presentation = getFridayBranchChildChipPresentation(studentStates[1], false, theme);
    assert.equal(presentation.icon, null);
    assert.equal(presentation.backgroundColor, "transparent");
    assert.equal(presentation.borderColor, theme.line);
    assert.equal(presentation.color, theme.muted);
  });

  it("uses primary styling for selected enrollable children", () => {
    const presentation = getFridayBranchChildChipPresentation(studentStates[1], true, theme);
    assert.equal(presentation.icon, null);
    assert.equal(presentation.backgroundColor, theme.primarySoft);
    assert.equal(presentation.borderColor, theme.primary);
    assert.equal(presentation.color, theme.primary);
  });

  it("uses muted styling for blocked children", () => {
    const presentation = getFridayBranchChildChipPresentation(studentStates[3], false, theme);
    assert.equal(presentation.icon, null);
    assert.equal(presentation.backgroundColor, theme.white);
    assert.equal(presentation.color, theme.muted);
  });
});

describe("syncFridayBranchChildSelection", () => {
  it("keeps enrolled selections and auto-selects remaining enrollable children", () => {
    const result = syncFridayBranchChildSelection(studentStates, ["caleb", "jon"]);
    assert.deepEqual(result.sort(), ["caleb", "jon", "julia"]);
  });

  it("drops withdrawn children from the prior selection", () => {
    const afterWithdraw = studentStates.map((student) =>
      student.studentId === "caleb"
        ? {
            studentId: student.studentId,
            studentName: student.studentName,
            canEnroll: true,
          }
        : student,
    );
    const result = syncFridayBranchChildSelection(afterWithdraw, ["caleb", "jon"]);
    assert.deepEqual(result.sort(), ["caleb", "jon", "julia"]);
  });
});
