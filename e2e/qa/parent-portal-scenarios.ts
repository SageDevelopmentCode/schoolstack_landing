import { expect } from "@playwright/test";
import type { PortalQaScenario } from "./portal-scenario-types";
import { assertCommitteeMobileMenu, committeeSectionUrl } from "./helpers/committee-qa";
import {
  parentCoopFeaturePath,
  parentSchoolFeaturePath,
  type CommitteeWorkspaceSection,
} from "./parent-paths";

const SEEDED_COMMITTEE_MESSAGE = "Welcome to the E2E committee channel.";

function committeeSectionScenario(
  id: string,
  section: CommitteeWorkspaceSection,
  options?: { layoutMinHeight?: boolean; layoutTestId?: string },
): PortalQaScenario {
  return {
    id,
    auth: "parent",
    buildPath: (manifest) => committeeSectionUrl(manifest, section),
    layoutTestId: options?.layoutTestId,
    layoutMinHeight: options?.layoutMinHeight ?? false,
    assertReady: async (page, manifest) => {
      await expect(page).toHaveURL(new RegExp(`section=${section}`));
      if (section === "messages") {
        const panel = page.getByTestId("committee-messages-panel");
        await expect(panel).toBeVisible({ timeout: 30_000 });
        await expect(panel.getByText(SEEDED_COMMITTEE_MESSAGE)).toBeVisible({
          timeout: 30_000,
        });
      } else {
        await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
      }
    },
    afterReady: async (page, viewport) => {
      await assertCommitteeMobileMenu(page, viewport);
    },
    loadBudgetMs: section === "messages" ? 15_000 : undefined,
  };
}

export const PARENT_PORTAL_QA_SCENARIOS: PortalQaScenario[] = [
  committeeSectionScenario("committee-messages", "messages", {
    layoutTestId: "committee-messages-panel",
    layoutMinHeight: true,
  }),
  committeeSectionScenario("committee-home", "home"),
  committeeSectionScenario("committee-tasks", "tasks"),
  committeeSectionScenario("committee-members", "members"),
  committeeSectionScenario("committee-resources", "resources"),
  committeeSectionScenario("committee-calendar", "calendar"),
  {
    id: "parent-messages-inbox",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("messages"),
    layoutTestId: "parent-messages-inbox-layout",
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-messages-inbox-header")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId("parent-messages-inbox-layout")).toBeVisible({
        timeout: 30_000,
      });
    },
    layoutMinHeight: true,
  },
  {
    id: "parent-home",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("portal"),
    assertReady: async (page) => {
      await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "parent-billing",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("billing"),
    assertReady: async (page) => {
      await expect(page.getByText("Loading billing…")).not.toBeVisible({
        timeout: 15_000,
      });
      const billingPanel = page
        .getByTestId("parent-billing-summary-panel")
        .or(page.getByTestId("parent-billing-child-detail-panel"))
        .or(page.getByTestId("parent-billing-readiness"))
        .filter({ visible: true })
        .first();
      await expect(billingPanel).toBeVisible({ timeout: 15_000 });
    },
  },
  {
    id: "parent-committees-list",
    auth: "parent",
    buildPath: () => `/school/rooted-meadows-school/parent/committees?tab=mine`,
    layoutTestId: "parent-committees-story-header",
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-committees-story-header")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-calendar",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("calendar"),
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-calendar-page")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-attendance",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("attendance"),
    assertReady: async (page) => {
      const list = page.getByTestId("parent-attendance-history-list");
      const empty = page.getByTestId("parent-attendance-history-empty");
      await expect(list.or(empty)).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "parent-children",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("children"),
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-children-story-header")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-children-health",
    auth: "parent",
    buildPath: (manifest) =>
      parentSchoolFeaturePath(
        "children",
        `applicationId=${manifest.applications.alphaChild}&section=health`,
      ),
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-children-record-workspace")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId("parent-health-form-fields")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-children-pickup",
    auth: "parent",
    buildPath: (manifest) =>
      parentSchoolFeaturePath(
        "children",
        `applicationId=${manifest.applications.alphaChild}&section=pickup`,
      ),
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-children-record-workspace")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByTestId("parent-children-record-nav")).toBeVisible();
    },
  },
  {
    id: "parent-classroom-signups",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("classroom_signups"),
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-classroom-signups-page")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-classroom-signup-detail",
    auth: "parent",
    buildPath: (manifest) =>
      parentSchoolFeaturePath(
        "classroom_signups",
        `signup=${manifest.classroomSignups.openSignupId}`,
      ),
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-classroom-signup-sidebar")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-forms-documents",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("forms_documents"),
    assertReady: async (page, manifest) => {
      await expect(page.getByTestId("parent-forms-documents-page")).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page.getByTestId(`parent-form-card-${manifest.parentPublishedFormId}`),
      ).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "parent-friday-branch",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("friday_branch"),
    assertReady: async (page, manifest) => {
      await expect(
        page.getByTestId(`parent-friday-branch-class-${manifest.fridayBranch.classId}`),
      ).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "parent-feed",
    auth: "parent",
    buildPath: () => parentSchoolFeaturePath("feed"),
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-portal-coming-soon")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-notifications",
    auth: "parent",
    buildPath: () => `/school/rooted-meadows-school/parent/notifications`,
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-notification-settings")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-coop-portal-home",
    auth: "parent",
    buildPath: (manifest) => parentCoopFeaturePath(manifest, "portal"),
    assertReady: async (page) => {
      await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "parent-coop-curriculum",
    auth: "parent",
    buildPath: (manifest) => parentCoopFeaturePath(manifest, "curriculum"),
    assertReady: async (page) => {
      await expect(page.getByTestId("curriculum-guide-list")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "parent-coop-supply-list",
    auth: "parent",
    buildPath: (manifest) => parentCoopFeaturePath(manifest, "supply_list"),
    assertReady: async (page) => {
      await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
      await expect(page.getByText("E2E Paper towels")).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "parent-coop-teaching-schedule",
    auth: "parent",
    buildPath: (manifest) => parentCoopFeaturePath(manifest, "teaching_schedule"),
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-coop-teaching-schedule-ready")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText("E2E Teaching Week")).toBeVisible({ timeout: 30_000 });
    },
  },
];

export const PARENT_PORTAL_QA_SCENARIO_IDS = PARENT_PORTAL_QA_SCENARIOS.map((s) => s.id);
