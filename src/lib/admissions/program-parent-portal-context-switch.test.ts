import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  detectParentPortalContextFromPathname,
  getActiveParentPortalContextId,
  parseParentPortalFeatureFromPathname,
  resolveParentPortalContextSwitchHref,
} from "./program-parent-portal-context-switch";
import {
  formatChildProgramLine,
  childLearnerSubtitleLine,
} from "@/components/school-parent/children/parent-children-utils";
import type { FamilyChildOverview } from "./parent-portal-access";
import { needsParentPortalContextSwitcher } from "@/lib/organization-settings/resolve-program-parent-features";

describe("program parent portal context switch", () => {
  it("detects main vs program pathname", () => {
    assert.deepEqual(
      detectParentPortalContextFromPathname(
        "/school/rooted-meadows-demo/parent/messages",
      ),
      { mode: "main" },
    );
    assert.deepEqual(
      detectParentPortalContextFromPathname(
        "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/messages",
      ),
      { mode: "program", portalSlug: "kindergarten-co-op" },
    );
  });

  it("parses current feature from pathname", () => {
    assert.equal(
      parseParentPortalFeatureFromPathname(
        "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/messages",
      )?.feature,
      "messages",
    );
    assert.equal(
      parseParentPortalFeatureFromPathname(
        "/school/rooted-meadows-demo/parent/children",
      )?.feature,
      "children",
    );
  });

  it("resolves switch href preserving feature when possible", () => {
    const href = resolveParentPortalContextSwitchHref({
      pathname: "/school/rooted-meadows-demo/parent/messages",
      slug: "rooted-meadows-demo",
      targetContext: {
        id: "program:coop",
        label: "Kindergarten Co-op",
        portalSlug: "kindergarten-co-op",
        programId: "coop",
        entryHref: "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal",
      },
      targetEntryHref:
        "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal",
    });

    assert.equal(
      href,
      "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/messages",
    );
  });

  it("falls back to entry href for main-only features", () => {
    const entryHref =
      "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal";
    const href = resolveParentPortalContextSwitchHref({
      pathname: "/school/rooted-meadows-demo/parent/children",
      slug: "rooted-meadows-demo",
      targetContext: {
        id: "program:coop",
        label: "Kindergarten Co-op",
        portalSlug: "kindergarten-co-op",
        programId: "coop",
        entryHref,
      },
      targetEntryHref: entryHref,
    });

    assert.equal(href, entryHref);
  });

  it("shows switcher when multiple contexts exist", () => {
    assert.equal(
      needsParentPortalContextSwitcher([
        { id: "main", label: "Rooted Meadows" },
        {
          id: "program:coop",
          label: "Kindergarten Co-op",
          portalSlug: "kindergarten-co-op",
          programId: "coop",
        },
      ]),
      true,
    );
    assert.equal(
      needsParentPortalContextSwitcher([{ id: "main", label: "Rooted Meadows" }]),
      false,
    );
  });

  it("resolves active context id from pathname", () => {
    const contexts = [
      { id: "main" as const, label: "Rooted Meadows" },
      {
        id: "program:coop" as const,
        label: "Kindergarten Co-op",
        portalSlug: "kindergarten-co-op",
        programId: "coop",
      },
    ];

    assert.equal(
      getActiveParentPortalContextId(
        contexts,
        "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/messages",
      ),
      "program:coop",
    );
    assert.equal(
      getActiveParentPortalContextId(
        contexts,
        "/school/rooted-meadows-demo/parent/messages",
      ),
      "main",
    );
  });
});

describe("child program labels", () => {
  const child: FamilyChildOverview = {
    applicationId: "app-1",
    studentId: "student-1",
    studentName: "Julia Cecilia",
    profilePhotoUrl: null,
    grade: "2",
    status: "enrolled",
    statusLabel: "Enrolled",
    isEnrolled: true,
    checklistProgress: null,
    enrolledPrograms: [
      {
        programId: "school-year",
        programName: "School Year 2026–27",
        portalSlug: null,
        isIsolatedPortal: false,
        portalLabel: "School Year 2026–27",
      },
      {
        programId: "coop",
        programName: "Kindergarten Co-op",
        portalSlug: "kindergarten-co-op",
        isIsolatedPortal: true,
        portalLabel: "Kindergarten Co-op",
      },
    ],
  };

  it("formats program line for learner strip", () => {
    assert.equal(
      formatChildProgramLine(child),
      "School Year 2026–27 · Kindergarten Co-op",
    );
    assert.match(childLearnerSubtitleLine(child), /Grade 2/);
    assert.match(childLearnerSubtitleLine(child), /Kindergarten Co-op/);
  });
});
