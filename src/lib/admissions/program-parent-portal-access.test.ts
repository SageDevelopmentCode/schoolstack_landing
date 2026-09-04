import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildParentPortalContextOptions,
  familyHasMainPortalEnrollment,
  type EnrolledProgramPortalSummary,
} from "./program-parent-portal-access";
import {
  resolveDefaultParentPortalEntryHrefFromContexts,
  shouldRedirectAwayFromMainParentPortal,
} from "./program-parent-portal-context-switch";
import { needsParentPortalContextSwitcher } from "@/lib/organization-settings/resolve-program-parent-features";

const schoolName = "Rooted Meadows Waldorf School (Demo)";

const schoolYearProgram: EnrolledProgramPortalSummary = {
  id: "school-year",
  name: "School Year 2026–27",
  portal_slug: "school-year-2026-27",
  parent_portal_settings: { mode: "inherit" },
};

const coOpProgram: EnrolledProgramPortalSummary = {
  id: "coop",
  name: "Kindergarten Co-op",
  portal_slug: "kindergarten-co-op",
  parent_portal_settings: {
    mode: "isolated",
    features: { portal: true, messages: true, calendar: true },
  },
};

describe("buildParentPortalContextOptions", () => {
  it("returns only isolated program contexts for co-op-only enrollment", () => {
    const contexts = buildParentPortalContextOptions(schoolName, [coOpProgram]);

    assert.deepEqual(contexts, [
      {
        id: "program:coop",
        label: "Kindergarten Co-op",
        portalSlug: "kindergarten-co-op",
        programId: "coop",
      },
    ]);
    assert.equal(needsParentPortalContextSwitcher(contexts), false);
  });

  it("returns main context only for school-year enrollment", () => {
    const contexts = buildParentPortalContextOptions(schoolName, [schoolYearProgram]);

    assert.deepEqual(contexts, [{ id: "main", label: schoolName }]);
    assert.equal(needsParentPortalContextSwitcher(contexts), false);
  });

  it("returns main and isolated contexts when enrolled in both", () => {
    const contexts = buildParentPortalContextOptions(schoolName, [
      schoolYearProgram,
      coOpProgram,
    ]);

    assert.equal(contexts.length, 2);
    assert.equal(contexts[0]?.id, "main");
    assert.equal(contexts[1]?.id, "program:coop");
    assert.equal(needsParentPortalContextSwitcher(contexts), true);
  });
});

describe("familyHasMainPortalEnrollment", () => {
  it("is false for isolated-only enrollments", () => {
    assert.equal(familyHasMainPortalEnrollment([coOpProgram]), false);
  });

  it("is true when any enrolled program uses the main portal", () => {
    assert.equal(familyHasMainPortalEnrollment([schoolYearProgram]), true);
    assert.equal(
      familyHasMainPortalEnrollment([schoolYearProgram, coOpProgram]),
      true,
    );
  });
});

describe("program-only main portal redirect helpers", () => {
  it("redirects away from main routes when only program contexts exist", () => {
    const contexts = buildParentPortalContextOptions(schoolName, [coOpProgram]);
    assert.equal(shouldRedirectAwayFromMainParentPortal(contexts), true);
  });

  it("does not redirect when main portal access exists", () => {
    const contexts = buildParentPortalContextOptions(schoolName, [
      schoolYearProgram,
      coOpProgram,
    ]);
    assert.equal(shouldRedirectAwayFromMainParentPortal(contexts), false);
  });

  it("uses the first context entry href as the default destination", () => {
    const contexts = [
      {
        id: "program:coop" as const,
        label: "Kindergarten Co-op",
        portalSlug: "kindergarten-co-op",
        programId: "coop",
        entryHref:
          "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal",
      },
    ];

    assert.equal(
      resolveDefaultParentPortalEntryHrefFromContexts(
        contexts,
        "/school/rooted-meadows-demo/parent/portal",
      ),
      "/school/rooted-meadows-demo/parent/p/kindergarten-co-op/portal",
    );
  });
});
