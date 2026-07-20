import { test, expect } from "@playwright/test";
import {
  beginApplyFormTest,
  endApplyFormTest,
  openNewApplicationForm,
} from "../helpers/apply-form";

test.describe.configure({ mode: "serial" });

test.beforeEach(async () => {
  await beginApplyFormTest();
});

test.afterEach(async () => {
  await endApplyFormTest();
});

async function fillRequiredStudentFields(
  page: import("@playwright/test").Page,
  firstName?: string,
) {
  const uniqueSuffix = Date.now().toString().slice(-6);

  await page.locator("#student_first_name").fill(firstName ?? `E2E${uniqueSuffix}`);
  await page.locator("#student_last_name").fill("SubmitTest");
  await page.locator("#student_date_of_birth").click();
  await page.getByRole("button", { name: "Today" }).click();

  const gradeTrigger = page.locator("#student_grade");
  await gradeTrigger.click();
  await page
    .getByRole("listbox", { name: "Grade level" })
    .getByRole("option", { name: "Kindergarten" })
    .click();
}

async function submitApplication(page: import("@playwright/test").Page) {
  const continueButton = page.getByRole("button", { name: /Save and continue/i });
  if (await continueButton.isVisible()) {
    await continueButton.click();
    await expect(page.getByText(/Step 2 of/i).first()).toBeVisible();
  }

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
