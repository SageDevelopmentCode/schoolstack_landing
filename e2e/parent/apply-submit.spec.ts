import { test, expect } from "@playwright/test";
import {
  advanceFromStudentStep,
  beginApplyFormTest,
  endApplyFormTest,
  fillRequiredStudentFields,
  openNewApplicationForm,
} from "../helpers/apply-form";

test.describe.configure({ mode: "serial" });
test.setTimeout(process.env.CI ? 60_000 : 30_000);

test.beforeEach(async () => {
  await beginApplyFormTest();
});

test.afterEach(async () => {
  await endApplyFormTest();
});

async function submitApplication(page: import("@playwright/test").Page) {
  await advanceFromStudentStep(page);
  await page.getByRole("button", { name: "Submit application" }).click();
}

test("parent can complete and submit a new application without a fee", async ({
  page,
}) => {
  await openNewApplicationForm(page);

  await fillRequiredStudentFields(page);

  await submitApplication(page);

  await expect(
    page.getByRole("heading", { name: "Application submitted" }),
  ).toBeVisible({ timeout: 15_000 });

  await expect(
    page.getByRole("link", { name: "View your applications" }),
  ).toBeVisible();
});

test("submitted application appears on the apply dashboard", async ({ page }) => {
  await openNewApplicationForm(page);

  const uniqueSuffix = Date.now().toString().slice(-6);
  const studentFirstName = `Dash${uniqueSuffix}`;

  await fillRequiredStudentFields(page, studentFirstName);

  await submitApplication(page);

  await expect(
    page.getByRole("heading", { name: "Application submitted" }),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("link", { name: "View your applications" }).click();

  await expect(
    page.getByRole("heading", { name: "Your applications" }),
  ).toBeVisible();
  await expect(page.getByText(studentFirstName)).toBeVisible();
});
