import { expect } from "@playwright/test";
import type { PortalQaScenario } from "./portal-scenario-types";
import { assertCommitteeMobileMenu, committeeSectionUrl } from "./helpers/committee-qa";
import type { CommitteeWorkspaceSection } from "./parent-paths";
import {
  teacherCommitteesListPath,
  teacherCommitteeWorkspacePath,
  teacherSchoolFeaturePath,
} from "./teacher-paths";

const SEEDED_COMMITTEE_MESSAGE = "Welcome to the E2E committee channel.";
const E2E_CLASSROOM_SIGNUP_TITLE = "E2E Classroom Volunteer Signup";

function teacherCommitteeSectionScenario(
  id: string,
  section: CommitteeWorkspaceSection,
  options?: { layoutMinHeight?: boolean; layoutTestId?: string },
): PortalQaScenario {
  return {
    id,
    auth: "staff",
    buildPath: (manifest) =>
      committeeSectionUrl(manifest, section, teacherCommitteeWorkspacePath),
    layoutTestId: options?.layoutTestId,
    layoutMinHeight: options?.layoutMinHeight ?? false,
    assertReady: async (page) => {
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

export const TEACHER_PORTAL_QA_SCENARIOS: PortalQaScenario[] = [
  {
    id: "teacher-dashboard",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("dashboard"),
    layoutTestId: "teacher-dashboard-workspace-nav",
    assertReady: async (page) => {
      await expect(page.getByTestId("teacher-dashboard-workspace-nav")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "teacher-messages",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("messages"),
    assertReady: async (page) => {
      await expect(page.getByText("Loading messages…")).not.toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByRole("main")).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "teacher-my-students",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("my_students"),
    assertReady: async (page) => {
      await expect(page.getByTestId("teacher-my-students-page")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText("Committee Portal")).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "teacher-classroom-signups",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("classroom_signups"),
    assertReady: async (page) => {
      await expect(page.getByTestId("teacher-classroom-signups-page")).toBeVisible({
        timeout: 30_000,
      });
      await expect(page.getByText(E2E_CLASSROOM_SIGNUP_TITLE)).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "teacher-classroom-signup-detail",
    auth: "staff",
    buildPath: (manifest) =>
      teacherSchoolFeaturePath(
        "classroom_signups",
        `signup=${manifest.classroomSignups.openSignupId}`,
      ),
    assertReady: async (page) => {
      await expect(page.getByTestId("teacher-classroom-signup-sidebar")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "teacher-forms-documents",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("forms_documents"),
    assertReady: async (page, manifest) => {
      await expect(page.getByTestId("teacher-forms-documents-page")).toBeVisible({
        timeout: 30_000,
      });
      await expect(
        page.getByTestId(`teacher-form-row-${manifest.parentPublishedFormId}`),
      ).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "teacher-calendar",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("calendar"),
    assertReady: async (page) => {
      const readOnlyCalendar = page.getByTestId("parent-calendar-page");
      const managerCalendar = page.getByRole("heading", { name: "Calendar" });
      await expect(readOnlyCalendar.or(managerCalendar)).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "teacher-attendance",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("attendance"),
    assertReady: async (page) => {
      await expect(page.getByTestId("teacher-attendance-page")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "teacher-committees-list",
    auth: "staff",
    buildPath: () => teacherCommitteesListPath(),
    layoutTestId: "parent-committees-story-header",
    assertReady: async (page) => {
      await expect(page.getByTestId("parent-committees-story-header")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  teacherCommitteeSectionScenario("teacher-committee-messages", "messages", {
    layoutTestId: "committee-messages-panel",
    layoutMinHeight: true,
  }),
  teacherCommitteeSectionScenario("teacher-committee-home", "home"),
  teacherCommitteeSectionScenario("teacher-committee-tasks", "tasks"),
  teacherCommitteeSectionScenario("teacher-committee-members", "members"),
  teacherCommitteeSectionScenario("teacher-committee-resources", "resources"),
  teacherCommitteeSectionScenario("teacher-committee-calendar", "calendar"),
  {
    id: "teacher-my-hours",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("my_hours"),
    assertReady: async (page) => {
      await expect(page.getByTestId("teacher-portal-coming-soon")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "teacher-feed",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("feed"),
    assertReady: async (page) => {
      await expect(page.getByTestId("teacher-portal-coming-soon")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
  {
    id: "teacher-payroll",
    auth: "staff",
    buildPath: () => teacherSchoolFeaturePath("payroll"),
    assertReady: async (page) => {
      await expect(page.getByTestId("teacher-portal-coming-soon")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
];

export const TEACHER_PORTAL_QA_SCENARIO_IDS = TEACHER_PORTAL_QA_SCENARIOS.map((s) => s.id);
