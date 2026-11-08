import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_FEATURES } from "./catalog";
import {
  applyPlanToFeatures,
  isMissingOrganizationPlanColumnError,
  parseOrganizationPlan,
} from "./plans";
import type { OrganizationFeatures } from "./types";

const PORTALS = ["admin", "teacher", "parent", "parent_home"] as const;

function trueBooleanPaths(features: OrganizationFeatures): string[] {
  const paths: string[] = [];

  for (const portal of PORTALS) {
    const record = features[portal];
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      continue;
    }
    for (const [key, value] of Object.entries(record)) {
      if (value === true) paths.push(`${portal}.${key}`);
    }
  }

  for (const [key, value] of Object.entries(features)) {
    if (value === true) paths.push(key);
  }

  return paths.sort();
}

function withEveryFlagOn(features: OrganizationFeatures): OrganizationFeatures {
  const next = structuredClone(features);

  for (const portal of PORTALS) {
    const record = next[portal];
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      continue;
    }
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === "boolean") {
        (record as Record<string, boolean>)[key] = true;
      }
    }
  }

  for (const [key, value] of Object.entries(next)) {
    if (typeof value === "boolean") {
      (next as Record<string, unknown>)[key] = true;
    }
  }

  (next.admin as Record<string, boolean>).future_widget = true;
  next.feature_nav = {
    admin: {
      groups: ["Workspace"],
      items: { dashboard: { group: "Workspace" } },
    },
  };
  return next;
}

describe("parseOrganizationPlan", () => {
  it("treats anything other than free as custom", () => {
    assert.equal(parseOrganizationPlan(undefined), "custom");
    assert.equal(parseOrganizationPlan(null), "custom");
    assert.equal(parseOrganizationPlan("nope"), "custom");
    assert.equal(parseOrganizationPlan("custom"), "custom");
    assert.equal(parseOrganizationPlan("free"), "free");
  });
});

describe("isMissingOrganizationPlanColumnError", () => {
  it("matches a missing plan column and ignores other failures", () => {
    assert.equal(
      isMissingOrganizationPlanColumnError({
        code: "42703",
        message: "column organizations.plan does not exist",
      }),
      true,
    );
    assert.equal(
      isMissingOrganizationPlanColumnError({
        code: "PGRST204",
        message:
          "Could not find the 'plan' column of 'organizations' in the schema cache",
      }),
      true,
    );
    assert.equal(
      isMissingOrganizationPlanColumnError({
        code: "42703",
        message: "column organizations.slug does not exist",
      }),
      false,
    );
    assert.equal(isMissingOrganizationPlanColumnError(null), false);
  });
});

describe("applyPlanToFeatures", () => {
  it("returns the same object for custom", () => {
    const input = withEveryFlagOn(DEFAULT_FEATURES);
    const output = applyPlanToFeatures(input, "custom");
    assert.equal(output, input);
    assert.deepEqual(output, input);
  });

  it("leaves only admin.dashboard on for free defaults", () => {
    const output = applyPlanToFeatures(DEFAULT_FEATURES, "free");
    assert.deepEqual(trueBooleanPaths(output), ["admin.dashboard"]);
  });

  it("forces stored and unknown flags off for free", () => {
    const input = withEveryFlagOn(DEFAULT_FEATURES);
    const output = applyPlanToFeatures(input, "free");

    assert.deepEqual(trueBooleanPaths(output), ["admin.dashboard"]);
    assert.equal(
      (output.admin as Record<string, boolean>).future_widget,
      false,
    );
    assert.equal(output.observation_booking, false);
    assert.equal(output.parent_home?.friday_branch, false);
    assert.deepEqual(output.feature_nav, input.feature_nav);
    assert.equal(input.admin.admissions, true);
  });

  it("keeps an allow-listed flag off when it was already off", () => {
    const input = structuredClone(DEFAULT_FEATURES);
    input.admin.dashboard = false;
    const output = applyPlanToFeatures(input, "free");
    assert.equal(output.admin.dashboard, false);
    assert.deepEqual(trueBooleanPaths(output), []);
  });
});
