import { expect } from "@playwright/test";
import type { PortalQaScenario } from "./portal-scenario-types";
import { PARENT_PORTAL_QA_SCENARIOS } from "./parent-portal-scenarios";
import { TEACHER_PORTAL_QA_SCENARIOS } from "./teacher-portal-scenarios";

const STAFF_AND_ADMIN_SCENARIOS: PortalQaScenario[] = [
  ...TEACHER_PORTAL_QA_SCENARIOS,
  {
    id: "admin-dashboard",
    auth: "school_admin",
    buildPath: () => `/school/rooted-meadows-school/admin/dashboard`,
    assertReady: async (page) => {
      await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "admin-admissions-submissions",
    auth: "school_admin",
    buildPath: () => `/school/rooted-meadows-school/admin/admissions/submissions`,
    assertReady: async (page) => {
      await expect(page.getByText("Status", { exact: true }).first()).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByRole("cell", { name: "Alpha Child" })).toBeVisible();
    },
  },
];

export type { PortalQaAuth, PortalQaScenario } from "./portal-scenario-types";

export const PORTAL_QA_SCENARIOS: PortalQaScenario[] = [
  ...PARENT_PORTAL_QA_SCENARIOS,
  ...STAFF_AND_ADMIN_SCENARIOS,
];

export const PORTAL_QA_GOLDEN_SCENARIO_IDS = PORTAL_QA_SCENARIOS.map((scenario) => scenario.id);

export { PARENT_PORTAL_QA_SCENARIOS, PARENT_PORTAL_QA_SCENARIO_IDS } from "./parent-portal-scenarios";
export { TEACHER_PORTAL_QA_SCENARIOS, TEACHER_PORTAL_QA_SCENARIO_IDS } from "./teacher-portal-scenarios";

export function resolvePortalQaScenarios(
  envValue: string | undefined,
): PortalQaScenario[] {
  const raw = envValue?.trim();
  if (!raw || raw === "all") {
    return PORTAL_QA_SCENARIOS;
  }
  if (raw === "parent-all") {
    return PARENT_PORTAL_QA_SCENARIOS;
  }
  if (raw === "teacher-all") {
    return TEACHER_PORTAL_QA_SCENARIOS;
  }
  const ids = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const byId = new Map(PORTAL_QA_SCENARIOS.map((s) => [s.id, s]));
  const selected: PortalQaScenario[] = [];
  for (const id of ids) {
    const scenario = byId.get(id);
    if (!scenario) {
      throw new Error(`Unknown PORTAL_QA_SCENARIOS id: ${id}`);
    }
    selected.push(scenario);
  }
  return selected;
}
