import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildParentPortalContextEntryHref,
  detectParentPortalContextFromPathname,
  getActiveParentPortalContextId,
  parseParentPortalFeatureFromPathname,
  resolveDefaultParentPortalEntryHrefFromContexts,
  resolveParentPortalContextSwitchHref,
  shouldRedirectAwayFromMainParentPortal,
} from "./program-parent-portal-context-switch";
import { DEFAULT_FEATURES } from "@/lib/organization-settings/catalog";
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
    assert.equal(
      parseParentPortalFeatureFromPathname(
        "/admin/preview/rooted-meadows/family/fam-1/parent/portal",
      )?.feature,
      "portal",
    );
    assert.equal(
      parseParentPortalFeatureFromPathname(
        "/admin/preview/rooted-meadows/family/fam-1/parent/p/kindergarten-co-op/portal",
      )?.feature,
      "portal",
    );
  });

  it("builds admin family preview parent entry hrefs", () => {
    const previewParentBasePath =
      "/admin/preview/rooted-meadows/family/fam-1/parent";
    const orgFeatures = { ...DEFAULT_FEATURES };

    assert.equal(
      buildParentPortalContextEntryHref({
        slug: "rooted-meadows",
        schoolName: "Rooted Meadows",
        orgFeatures,
        context: { id: "main", label: "Rooted Meadows" },
        previewParentBasePath,
      }),
      `${previewParentBasePath}/portal`,
    );

    assert.equal(
      buildParentPortalContextEntryHref({
        slug: "rooted-meadows",
        schoolName: "Rooted Meadows",
        orgFeatures,
        context: {
          id: "program:coop",
          label: "Kindergarten Co-op",
          portalSlug: "kindergarten-co-op",
          programId: "coop",
        },
        previewParentBasePath,
        programSettings: {
          mode: "isolated",
          features: { portal: true, messages: true, calendar: true },
        },
      }),
      `${previewParentBasePath}/p/kindergarten-co-op/portal`,
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

  it("falls back to entry href when switching from program curriculum to main", () => {
    const mainEntryHref = "/school/rooted-meadows-demo/parent/portal";
    const href = resolveParentPortalContextSwitchHref({
      pathname:
        "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/curriculum",
      slug: "rooted-meadows-demo",
      targetContext: {
        id: "main",
        label: "Rooted Meadows",
      },
      targetEntryHref: mainEntryHref,
    });

    assert.equal(href, mainEntryHref);
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
    assert.equal(
      needsParentPortalContextSwitcher([
        {
          id: "program:coop",
          label: "Kindergarten Co-op",
          portalSlug: "kindergarten-co-op",
          programId: "coop",
        },
      ]),
      false,
    );
  });

  it("flags program-only families for main portal redirect", () => {
    assert.equal(
      shouldRedirectAwayFromMainParentPortal([
        {
          id: "program:coop",
          label: "Kindergarten Co-op",
          portalSlug: "kindergarten-co-op",
          programId: "coop",
          entryHref:
            "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal",
        },
      ]),
      true,
    );
  });

  it("prefers the first context entry href for default navigation", () => {
    assert.equal(
      resolveDefaultParentPortalEntryHrefFromContexts(
        [
          {
            id: "program:coop",
            label: "Kindergarten Co-op",
            portalSlug: "kindergarten-co-op",
            programId: "coop",
            entryHref:
              "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal",
          },
        ],
        "/school/rooted-meadows-demo/parent/portal",
      ),
      "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal",
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
