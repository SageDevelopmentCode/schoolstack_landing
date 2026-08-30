import { test, expect } from "@playwright/test";
import { TEST_ORG_SLUG } from "../helpers/constants";
import {
  cleanupIncompleteAgreementState,
  seedIncompleteAgreementState,
} from "../helpers/enrollment-agreement-fixtures";

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  await cleanupIncompleteAgreementState();
});

test.afterAll(async () => {
  await cleanupIncompleteAgreementState();
});

test("incomplete agreement banner shows on parent portal", async ({ page }) => {
  await seedIncompleteAgreementState(TEST_ORG_SLUG);

  await page.goto(`/school/${TEST_ORG_SLUG}/parent/portal`);

  await expect(
    page.getByText("Enrollment agreement incomplete for Alpha"),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue signing" })).toBeVisible();
});

test("complete agreement routes to first unsigned section", async ({ page }) => {
  const state = await seedIncompleteAgreementState(TEST_ORG_SLUG);

  await page.goto(state.enrollmentHref);

  await expect(page.getByText("Section 3 of 3")).toBeVisible();
  await page.getByRole("button", { name: "Complete agreement" }).click();
  await expect(page.getByText("Section 1 of 3")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tuition Summary" })).toBeVisible();
});
