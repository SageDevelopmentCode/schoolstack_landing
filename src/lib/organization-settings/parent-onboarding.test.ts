import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import {
  resolveParentOnboardingHref,
  shouldShowParentOnboardingItem,
} from "./parent-onboarding";
import type { FamilyChildOverview } from "@/lib/admissions/parent-portal-access";

function makeChild(applicationId: string, studentId: string | null): FamilyChildOverview {
  return {
    applicationId,
    studentId,
    studentName: "Test Child",
    grade: "1",
    status: "enrolled",
    statusLabel: "Enrolled",
    isEnrolled: true,
    profilePhotoUrl: null,
    checklistProgress: null,
    enrolledPrograms: [],
  };
}

describe("resolveParentOnboardingHref", () => {
  it("deep links pickup to the first child with a student record", () => {
    const href = resolveParentOnboardingHref("demo-school", "pickup", {
      familyChildren: [
        makeChild("app-1", null),
        makeChild("app-2", "student-2"),
        makeChild("app-3", "student-3"),
      ],
    });

    assert.equal(
      href,
      "/school/demo-school/parent/children?applicationId=app-2&section=pickup",
    );
  });

  it("returns null for pickup when no child has a student record", () => {
    const href = resolveParentOnboardingHref("demo-school", "pickup", {
      familyChildren: [makeChild("app-1", null)],
    });

    assert.equal(href, null);
  });
});

describe("shouldShowParentOnboardingItem", () => {
  it("shows pickup when children feature is enabled and a student exists", () => {
    const features = {
      ...DEFAULT_FEATURES,
      parent: {
        ...DEFAULT_FEATURES.parent,
        children: true,
      },
    };

    assert.equal(
      shouldShowParentOnboardingItem(
        features,
        {
          id: "authorized_pickup",
          label: "Set your authorized pickup list",
          icon: "user-check",
          target: "pickup",
        },
        [makeChild("app-1", "student-1")],
      ),
      true,
    );
  });

  it("hides pickup when children feature is disabled", () => {
    const features = {
      ...DEFAULT_FEATURES,
      parent: {
        ...DEFAULT_FEATURES.parent,
        children: false,
      },
    };

    assert.equal(
      shouldShowParentOnboardingItem(
        features,
        {
          id: "authorized_pickup",
          label: "Set your authorized pickup list",
          icon: "user-check",
          target: "pickup",
        },
        [makeChild("app-1", "student-1")],
      ),
      false,
    );
  });
});
