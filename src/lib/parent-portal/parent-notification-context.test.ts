import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { EnrolledProgramPortalSummary } from "@/lib/admissions/program-parent-portal-access";
import {
  buildNotificationContextsFromEnrolledPrograms,
  buildProgramParentNotificationContext,
  parseParentNotificationContextFromSearchParams,
} from "@/lib/parent-portal/parent-notification-context";

const slug = "rooted-meadows";

const schoolYearProgram: EnrolledProgramPortalSummary = {
  id: "school-year",
  name: "School Year 2026–27",
  portal_slug: "school-year-2026-27",
  parent_portal_settings: { mode: "inherit" },
};

const coopProgram: EnrolledProgramPortalSummary = {
  id: "coop",
  name: "Kindergarten Co-op",
  portal_slug: "kindergarten-co-op",
  parent_portal_settings: {
    mode: "isolated",
    coop_mode: true,
    features: { portal: true, messages: true, calendar: true },
  },
};

describe("buildNotificationContextsFromEnrolledPrograms", () => {
  it("returns only program context for co-op-only families", () => {
    const contexts = buildNotificationContextsFromEnrolledPrograms(slug, [
      coopProgram,
    ]);

    assert.equal(contexts.length, 1);
    assert.equal(contexts[0]?.mode, "program");
    if (contexts[0]?.mode === "program") {
      assert.equal(contexts[0].programId, "coop");
      assert.equal(contexts[0].coopModeEnabled, true);
      assert.equal(
        contexts[0].parentNavBasePath,
        `/school/${slug}/parent/p/kindergarten-co-op`,
      );
    }
  });

  it("returns main plus co-op program contexts when both enrollments exist", () => {
    const contexts = buildNotificationContextsFromEnrolledPrograms(slug, [
      schoolYearProgram,
      coopProgram,
    ]);

    assert.equal(contexts.length, 2);
    assert.equal(contexts[0]?.mode, "main");
    assert.equal(contexts[1]?.mode, "program");
  });
});

describe("parseParentNotificationContextFromSearchParams", () => {
  it("parses program mode params", () => {
    const params = new URLSearchParams({
      mode: "program",
      programId: "coop",
      programSlug: "kindergarten-co-op",
      coopModeEnabled: "true",
      parentNavBasePath: `/school/${slug}/parent/p/kindergarten-co-op`,
    });

    const context = parseParentNotificationContextFromSearchParams(slug, params);
    assert.equal(context.mode, "program");
    if (context.mode === "program") {
      assert.equal(context.programId, "coop");
      assert.equal(context.coopModeEnabled, true);
    }
  });

  it("falls back to main mode when program params are incomplete", () => {
    const params = new URLSearchParams({ mode: "program", programId: "coop" });
    const context = parseParentNotificationContextFromSearchParams(slug, params);
    assert.equal(context.mode, "main");
  });
});

describe("buildProgramParentNotificationContext", () => {
  it("builds program-scoped nav paths", () => {
    const context = buildProgramParentNotificationContext(
      slug,
      "coop",
      "kindergarten-co-op",
      true,
    );

    assert.equal(context.mode, "program");
    assert.equal(
      context.parentNavBasePath,
      `/school/${slug}/parent/p/kindergarten-co-op`,
    );
  });
});
