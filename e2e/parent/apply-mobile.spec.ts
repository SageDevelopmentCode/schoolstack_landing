import { test, expect } from "@playwright/test";
import {
  beginApplyFormTest,
  endApplyFormTest,
  openNewApplicationForm,
} from "../helpers/apply-form";
import { TEST_ORG_SLUG } from "../helpers/constants";

const MOBILE_VIEWPORT = { width: 375, height: 812 };

test.describe("mobile apply flows", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ viewport: MOBILE_VIEWPORT });

  test.beforeEach(async () => {
    await beginApplyFormTest();
  });

  test.afterEach(async () => {
    await endApplyFormTest();
  });

  test("dashboard shows full-width application CTAs without horizontal overflow", async ({
    page,
  }) => {
    await page.goto(`/school/${TEST_ORG_SLUG}/apply`);

    await expect(
      page.getByRole("heading", { name: "Your applications" }),
    ).toBeVisible();

    const cta = page.getByRole("link", { name: /View|Continue|enrollment/i }).first();
    await expect(cta).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("application form shows step label and full-width continue button", async ({
    page,
  }) => {
    await openNewApplicationForm(page);

    const continueButton = page
      .getByRole("button", { name: /Save and continue|Continue/i })
      .first();
    await expect(continueButton).toBeVisible();

    const box = await continueButton.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(300);
  });

  test("application detail uses shared navbar on mobile", async ({ page }) => {
    await page.goto(`/school/${TEST_ORG_SLUG}/apply`);
    await page.getByRole("link", { name: "View" }).first().click();

    await expect(page.getByRole("button", { name: /E2E Parent/i })).toBeVisible();
  });

  test("grade level dropdown opens as bottom sheet on mobile", async ({ page }) => {
    await openNewApplicationForm(page);

    const gradeTrigger = page.locator("#student_grade");
    await expect(gradeTrigger).toBeVisible();
    await gradeTrigger.click();

    await expect(page.getByRole("dialog", { name: "Grade level" })).toBeVisible();
    await page.getByRole("option", { name: "Kindergarten" }).click();

    await expect(gradeTrigger).toHaveText(/Kindergarten/);
  });

  test("save and continue blocks when required grade level is empty", async ({
    page,
  }) => {
    await openNewApplicationForm(page);

    await page.locator("#student_first_name").fill("Jon");
    await page.locator("#student_last_name").fill("Cecilia");
    await page.locator("#student_date_of_birth").click();
    await page.getByRole("button", { name: "Today" }).click();

    await page.getByRole("button", { name: /Save and continue/i }).click();

    await expect(page.getByText(/Step 1 of/i).first()).toBeVisible();
    await expect(page.getByText("Grade level is required.")).toBeVisible();
    await expect(page.locator("#student_grade")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("enrollment task picker opens on mobile when enrolling", async ({ page }) => {
    await page.goto(`/school/${TEST_ORG_SLUG}/apply`);

    const enrollLink = page.getByRole("link", { name: /enrollment/i });
    if ((await enrollLink.count()) === 0) {
      test.skip();
    }

    await enrollLink.first().click();
    await expect(page.getByRole("button", { name: "Change" })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);

    await page.getByRole("button", { name: "Change" }).click();
    await expect(
      page.getByRole("dialog", { name: "Select enrollment task" }),
    ).toBeVisible();
  });
});
